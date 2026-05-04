/**
 * Image services for SIS Activities — find, generate, or download.
 *
 *   searchImages(source, q)        — Pexels or Unsplash keyword search (local)
 *   downloadToActivities(url, dir) — fetch a remote image, save locally
 *   generateImage(prompt, dir)     — HTTP-call hub.foxfix.ai/web/generate-image
 *                                    (Gemini Nano Banana Pro lives there)
 *
 * Keys: PEXELS_API_KEY, UNSPLASH_ACCESS_KEY (env). Gemini key lives on hub.
 */
import fs from 'fs';
import path from 'path';

export interface ImageSearchResult {
  thumbUrl: string;
  fullUrl: string;
  attribution: string;
  attributionUrl?: string;
  source: 'pexels' | 'unsplash';
}

export async function searchImages(source: string, q: string): Promise<ImageSearchResult[]> {
  if (source === 'pexels') return searchPexels(q);
  if (source === 'unsplash') return searchUnsplash(q);
  throw new Error(`Unknown source: ${source}`);
}

async function searchPexels(q: string): Promise<ImageSearchResult[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error('PEXELS_API_KEY not set');
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=15&orientation=landscape`;
  const r = await fetch(url, { headers: { Authorization: key } });
  if (!r.ok) throw new Error(`Pexels: ${r.status} ${await r.text().catch(() => '')}`);
  const data: any = await r.json();
  return (data.photos || []).map((p: any): ImageSearchResult => ({
    thumbUrl: p.src.medium,
    fullUrl: p.src.large2x || p.src.large || p.src.original,
    attribution: `Photo by ${p.photographer} on Pexels`,
    attributionUrl: p.url,
    source: 'pexels',
  }));
}

async function searchUnsplash(q: string): Promise<ImageSearchResult[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error('UNSPLASH_ACCESS_KEY not set');
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=15&orientation=landscape&client_id=${encodeURIComponent(key)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Unsplash: ${r.status} ${await r.text().catch(() => '')}`);
  const data: any = await r.json();
  return (data.results || []).map((p: any): ImageSearchResult => ({
    thumbUrl: p.urls.small,
    fullUrl: p.urls.regular,
    attribution: `Photo by ${p.user?.name || 'Unknown'} on Unsplash`,
    attributionUrl: p.links?.html,
    source: 'unsplash',
  }));
}

export async function downloadToActivities(url: string, dir: string): Promise<string> {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Image fetch ${r.status}`);
  const ct = r.headers.get('content-type') || 'image/jpeg';
  const ext = ct.includes('png') ? '.png' : ct.includes('webp') ? '.webp' : '.jpg';
  const filename = `${Date.now()}-attached${ext}`;
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(path.join(dir, filename), buf);
  return filename;
}

/**
 * AI image generation via hub.foxfix.ai/web/generate-image.
 *
 * Hub uses @google/genai SDK with `gemini-3-pro-image-preview` (Nano Banana
 * Pro) — that whole setup lives on hub, not duplicated here. The prompt is
 * augmented with activity-context guardrails (photoreal, Dublin context, no
 * text overlays — Meta auto-rejects boost-eligibility for image-with-text).
 *
 * Hub returns a URL we can fetch — we download it once into uploads/activities/
 * so attachment serving + cleanup follows the same pattern as uploads.
 */
export async function generateImage(prompt: string, dir: string): Promise<string> {
  const hubUrl = process.env.META_HUB_URL;
  if (!hubUrl) throw new Error('META_HUB_URL not set');

  const guardedPrompt =
    `${prompt}. ` +
    `Photoreal, vibrant, warm natural light, candid composition, ` +
    `Dublin / Ireland context if location-relevant. ` +
    `No text or logos in the image. Wide landscape orientation. High resolution.`;

  const r = await fetch(`${hubUrl}/web/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: guardedPrompt, size: '16:9' }),
  });
  if (!r.ok) throw new Error(`Hub gen: ${r.status} ${await r.text().catch(() => '')}`);
  const data: any = await r.json();
  if (data.error) throw new Error(`Hub gen: ${data.error}`);

  // Hub returns { status, url, filename, ... } — url is relative, prepend hub.
  const imgUrl = data.url?.startsWith('http') ? data.url : `${hubUrl}${data.url}`;
  if (!imgUrl) throw new Error('Hub gen: no image url in response');

  return downloadToActivities(imgUrl, dir);
}

/**
 * Passport image/PDF → structured identity fields, via OpenAI vision (gpt-4o-mini).
 *
 * Mirrors the booking-parser pattern (same OPENAI_API_KEY, json_object mode,
 * temperature 0) but feeds an IMAGE because a passport is a photo, and its
 * machine-readable zone (the two `<<<` lines) is highly structured, so
 * extraction is reliable.
 *
 * PDFs are common for passport scans, so a PDF's first page is rasterised to PNG
 * with poppler's pdftoppm (already on the box, same toolchain as booking-parser)
 * before being sent to the vision model. HEIC and other types the model can't
 * read return supported:false so the caller falls back to manual entry.
 *
 * Output is ALWAYS for a human to confirm before save — this module only reads
 * and returns; it never writes to the student record.
 *
 * No new npm deps: fs/child_process + global fetch.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileP = promisify(execFile);
const OPENAI_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';
const VISION_MIME = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);
const SUPPORTED_MIME = new Set([...VISION_MIME, 'application/pdf']);

export interface ParsedPassport {
  passportNumber: string | null;
  surname: string | null;
  givenNames: string | null;
  dateOfBirth: string | null;   // YYYY-MM-DD
  dateOfIssue: string | null;   // YYYY-MM-DD (printed visual zone; often absent in MRZ)
  dateOfExpiry: string | null;  // YYYY-MM-DD
  nationality: string | null;   // 3-letter code as printed, else country name
  sex: 'M' | 'F' | null;
  needsReview: string[];
}

const SYSTEM_PROMPT = `You read a passport photo/scan and extract its identity fields into a FIXED JSON object. Prefer the machine-readable zone (the two lines of "<<<" at the bottom) — it is the most reliable source — but use the printed visual zone for fields the MRZ lacks (especially date of issue). Rules:
- Output ONLY the JSON object. No prose, no markdown fences.
- Dates: "YYYY-MM-DD". MRZ dates are YYMMDD — expand the century sensibly (issue/expiry are recent or future; date of birth is in the past). Blank/unreadable → null.
- passportNumber: the document number (line 2 of the MRZ, positions 1-9, dropping filler "<").
- sex: "M" or "F" only; else null.
- nationality: the 3-letter code as printed (e.g. "BRA"); if only a country name is legible, use that.
- NEVER invent. If a field is not legible, set it null AND add its name to "needsReview".
- If the image is not a passport, or is unreadable, set all fields null and put "not_a_passport" in needsReview.

Schema (every key REQUIRED; null when absent):
{"passportNumber":str|null,"surname":str|null,"givenNames":str|null,"dateOfBirth":str|null,"dateOfIssue":str|null,"dateOfExpiry":str|null,"nationality":str|null,"sex":"M"|"F"|null,"needsReview":[str]}`;

// Produce a vision-ready image (buffer + mime) from the uploaded file: images
// pass through as-is; a PDF's first page is rasterised to PNG at 200 DPI (sharp
// enough for the MRZ). Returns null for types we can't turn into an image.
async function toImage(filePath: string, mime: string): Promise<{ buf: Buffer; mime: string } | null> {
  if (VISION_MIME.has(mime)) {
    const buf = await fs.promises.readFile(filePath);
    return { buf, mime: mime === 'image/jpg' ? 'image/jpeg' : mime };
  }
  if (mime === 'application/pdf') {
    const out = path.join(os.tmpdir(), `pp-${crypto.randomBytes(6).toString('hex')}`);
    try {
      // -singlefile → output is exactly `${out}.png` (no page-number suffix).
      await execFileP('pdftoppm', ['-png', '-f', '1', '-l', '1', '-r', '200', '-singlefile', filePath, out], { maxBuffer: 32 * 1024 * 1024 });
      const png = `${out}.png`;
      const buf = await fs.promises.readFile(png);
      fs.promises.unlink(png).catch(() => {});
      return { buf, mime: 'image/png' };
    } catch { return null; }
  }
  return null;
}

export async function parsePassport(
  filePath: string,
  mimeType: string,
): Promise<{ supported: boolean; extracted: ParsedPassport | null; error?: string }> {
  const mime = (mimeType || '').toLowerCase();
  if (!SUPPORTED_MIME.has(mime)) return { supported: false, extracted: null };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { supported: false, extracted: null, error: 'OPENAI_API_KEY not set' };

  let img: { buf: Buffer; mime: string } | null;
  try {
    img = await toImage(filePath, mime);
  } catch {
    return { supported: true, extracted: null, error: 'could not read uploaded file' };
  }
  if (!img) return { supported: true, extracted: null, error: 'could not convert file to an image' };

  const dataUri = `data:${img.mime};base64,${img.buf.toString('base64')}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract the fields from this passport.' },
              { type: 'image_url', image_url: { url: dataUri, detail: 'high' } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { supported: true, extracted: null, error: `OpenAI ${res.status}: ${t.slice(0, 200)}` };
    }
    const data: any = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    let p: ParsedPassport;
    try { p = JSON.parse(content); } catch { return { supported: true, extracted: null, error: 'model returned non-JSON' }; }
    if (!Array.isArray((p as any).needsReview)) (p as any).needsReview = [];
    return { supported: true, extracted: p };
  } catch (e: any) {
    return { supported: true, extracted: null, error: String(e?.message || e) };
  }
}

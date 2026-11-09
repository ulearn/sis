/**
 * Garda vetting uploads → an AI read of each document (Neil 2026-11-08): the host uploads the wet-signed form, their ID and a
 * proof of address in the portal; each file is read here the moment it arrives and the host is told at once if it doesn't
 * pass. The set is "done" only when all three are in and pass — then (and only then) accomm@ is told it is ready for EEI.
 *
 *   checkVettingDoc(kind, filePath, mime, person) → { ok: true|false|null, docType, issues[], docDate, at }
 *     ok null = couldn't be read automatically (HEIC, API down): accepted, flagged for a person to look at.
 *
 * Same pattern as passport-parser.ts (OpenAI vision, json_object, temperature 0, PDF page 1 → PNG). Only reads; never stores
 * the image anywhere else. What passes is EEI's own rule list (kb/accommodation/garda-vetting-process.md).
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileP = promisify(execFile);
const MODEL = process.env.VETTING_CHECK_MODEL || process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';
const VISION_MIME = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);

export type VettingDocKind = 'form' | 'idFront' | 'idBack' | 'poa';
export interface VettingCheck { ok: boolean | null; docType: string | null; issues: string[]; docDate: string | null; at: string }
export interface VettingPerson { name: string; dob?: string; address?: string; minor?: boolean }

// Every page of a PDF (up to 4) — the NVB form's signature box is on page 2, so page 1 alone isn't enough.
async function toImages(filePath: string, mime: string): Promise<{ buf: Buffer; mime: string }[]> {
  if (VISION_MIME.has(mime)) return [{ buf: await fs.promises.readFile(filePath), mime: mime === 'image/jpg' ? 'image/jpeg' : mime }];
  if (mime === 'application/pdf') {
    const out = path.join(os.tmpdir(), `gv-${crypto.randomBytes(6).toString('hex')}`);
    try {
      await execFileP('pdftoppm', ['-png', '-f', '1', '-l', '4', '-r', '150', filePath, out], { maxBuffer: 64 * 1024 * 1024 });
      const dir = path.dirname(out), base = path.basename(out);
      const files = (await fs.promises.readdir(dir)).filter(f => f.startsWith(base + '-') && f.endsWith('.png')).sort();
      const imgs = [];
      for (const f of files) { const full = path.join(dir, f); imgs.push({ buf: await fs.promises.readFile(full), mime: 'image/png' }); fs.promises.unlink(full).catch(() => {}); }
      return imgs;
    } catch { return []; }
  }
  return [];
}

function brief(kind: VettingDocKind, p: VettingPerson, today: string): string {
  const who = `Expected person: ${p.name}${p.dob ? `, born ${p.dob}` : ''}${p.address ? `, living at ${p.address}` : ''}. Today is ${today}.`;
  const rules: Record<VettingDocKind, string> = {
    form: `This should be an Irish Garda vetting form (NVB 1 "Vetting Invitation" or NVB 3 "Parent/Guardian Consent"), printed, then SIGNED BY HAND (a real ink signature in the signature box, not typed) and dated. It may have several pages — the signature box is usually on the LAST page; look at every page. Fail if: not that form; no handwritten signature on any page; the name on it is a different person; the page is too blurred to read.`,
    idFront: p.minor
      ? `This should be the ID of a 16–17 year old: a passport photo page or a birth certificate. Fail if: another kind of document; the name doesn't match; unreadable. Report a passport's expiry date in docDate (birth certificate: null).`
      : `This should be photo ID: a passport photo page, or the FRONT of a driving licence (Irish or other). Fail if: another kind of document; the name doesn't match the expected person (allow middle names, accents, maiden/married names); unreadable; the photo or the name is covered. Do NOT judge expiry — report the expiry date in docDate.`,
    idBack: `This should be the BACK of a driving licence. Fail only if it is clearly something else or unreadable.`,
    poa: `This should be a proof of address: a postal letter OR a PDF/online document from a utility (electricity, gas, broadband, TV, bin service), a bank (any bank document, incl. app/online PDFs like Revolut or AIB), or Revenue / another government body. It must show the person's name and home address and a date. A MOBILE PHONE bill is NOT accepted. Do NOT judge how old it is (that is checked separately) — just report the date in docDate. A document in JOINT names (e.g. "Mr/Mrs Yan Zhang Mark Haslam", "A & B Murphy") counts for EACH person named — that is a match. Fail if: none of those sources; mobile phone bill; the person isn't among the names on it; the address is clearly a different place; no date visible; unreadable.`,
  };
  return `You check one document a host family uploaded for Irish Garda vetting. ${who}
${rules[kind]}
Output ONLY JSON: {"ok":true|false,"docType":"short description, e.g. 'Irish driving licence (front)', 'Electric Ireland bill', 'Revolut statement PDF'","docDate":"YYYY-MM-DD"|null (issue/statement date; for an ID its expiry),"issues":["each reason it fails, in plain words a host understands, e.g. 'The bill is dated March 2025 — we need one from the last 6 months.'"]}
issues is [] when ok. Never invent what you can't read: if unreadable, ok=false with issue "We couldn't read it — please upload a clearer photo."`;
}

export async function checkVettingDoc(kind: VettingDocKind, filePath: string, mimeType: string, person: VettingPerson): Promise<VettingCheck> {
  const at = new Date().toISOString();
  const skip = (why: string): VettingCheck => ({ ok: null, docType: null, issues: [why], docDate: null, at });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return skip('Not checked automatically (no OpenAI key) — a person will look at it.');
  let imgs: { buf: Buffer; mime: string }[] = [];
  try { imgs = await toImages(filePath, (mimeType || '').toLowerCase()); } catch {}
  if (!imgs.length) return skip('Not checked automatically (file type) — a person will look at it.');
  const today = new Date().toISOString().slice(0, 10);
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 45000);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', signal: ctl.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL, temperature: 0, response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: brief(kind, person, today) },
          { role: 'user', content: [{ type: 'text', text: imgs.length > 1 ? `Check this document (${imgs.length} pages, in order).` : 'Check this document.' }, ...imgs.map(img => ({ type: 'image_url', image_url: { url: `data:${img.mime};base64,${img.buf.toString('base64')}`, detail: 'high' } }))] },
        ],
      }),
    });
    clearTimeout(t);
    if (!res.ok) return skip(`Not checked automatically (OpenAI ${res.status}) — a person will look at it.`);
    const j: any = JSON.parse((await res.json() as any).choices?.[0]?.message?.content || '{}');
    const issues = Array.isArray(j.issues) ? j.issues.map(String).filter(Boolean) : [];
    // Dates are decided here, not by the model (it gets date arithmetic wrong): proof of address ≤ 6 months old, ID not expired.
    const d = /^\d{4}-\d{2}-\d{2}$/.test(String(j.docDate || '')) ? new Date(j.docDate + 'T00:00:00Z') : null;
    const dropDateTalk = (xs: string[]) => xs.filter(x => !/(dated|months?|expir|old|recent)/i.test(x));
    if (kind === 'poa') {
      const kept = dropDateTalk(issues); issues.length = 0; issues.push(...kept);
      if (!d) issues.push('We couldn\'t see a date on it — it must be dated in the last 6 months.');
      else if (d.getTime() < Date.now() - 183 * 864e5) issues.push(`It is dated ${j.docDate} — we need one from the last 6 months.`);
      else if (d.getTime() > Date.now() + 31 * 864e5) issues.push(`We read the date as ${j.docDate}, which can't be right — please upload a clearer copy.`);
      if (!issues.length) j.ok = true;
    }
    if (kind === 'idFront' && d && /passport|licen[cs]e/i.test(String(j.docType || ''))) {
      const kept = dropDateTalk(issues); issues.length = 0; issues.push(...kept);
      if (d.getTime() < Date.now() - 864e5) issues.push(`It expired on ${j.docDate} — please upload a valid one.`);
      if (!issues.length) j.ok = true;
    }
    const ok = j.ok === true && !issues.length;
    return { ok, docType: j.docType ? String(j.docType) : null, issues: ok ? [] : (issues.length ? issues : ['We couldn\'t confirm this document — please upload it again.']), docDate: j.docDate || null, at };
  } catch (e: any) {
    return skip('Not checked automatically (timeout) — a person will look at it.');
  }
}

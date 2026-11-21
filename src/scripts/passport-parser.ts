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
  nationalityCountry?: string | null;  // the same nationality as an English country name ("Italy") — SIS stores names
  sex: 'M' | 'F' | null;
  documentType?: 'passport' | 'id_card' | null;  // EU juniors often fly on a national ID card (Neil 2026-11-20)
  needsReview: string[];
}

const SYSTEM_PROMPT = `You read a photo/scan of a travel document — a PASSPORT or a national IDENTITY CARD (e.g. the Italian "Carta di Identità", front, back, or both sides in one image) — and extract its identity fields into a FIXED JSON object. Labels may be in Italian or another language (Cognome = surname, Nome = given names, Data di nascita = date of birth, Sesso = sex, Cittadinanza = nationality, Emissione/Rilascio = issue, Scadenza = expiry). Prefer the machine-readable zone (the lines of "<<<") — it is the most reliable source — but use the printed visual zone for fields the MRZ lacks (especially date of issue). Rules:
- mrz: the machine-readable lines EXACTLY as printed, one string per line, every character including each "<" (count them carefully); [] if none visible.
- documentType: "passport" (MRZ starts "P", 2 lines of 44) or "id_card" (MRZ starts "I", "C" or "A", 3 lines of 30; or the card says Identity Card / Carta di Identità); null if unsure.
- On an ID card's 3-line MRZ: line 1 positions 6-14 are the document number; line 2 holds date of birth (YYMMDD), sex, expiry (YYMMDD) and nationality; line 3 holds SURNAME<<GIVEN<NAMES. The document number is also printed on the front (often top right, e.g. "CA01960QR"). Do NOT use the fiscal code, the card serial under the photo area, or birth-record numbers.
- Printed dates on ID cards are usually DD.MM.YYYY.
- Output ONLY the JSON object. No prose, no markdown fences.
- Dates: "YYYY-MM-DD". MRZ dates are YYMMDD — expand the century sensibly (issue/expiry are recent or future; date of birth is in the past). Blank/unreadable → null.
- passportNumber: the document number (passport: line 2 of the MRZ, positions 1-9; ID card: as above), dropping filler "<".
- sex: "M" or "F" only; else null.
- nationality: the 3-letter code as printed (e.g. "BRA"); if only a country name is legible, use that.
- nationalityCountry: that nationality as the plain English country name (e.g. "Brazil", "Italy", "United Kingdom"); null if unknown.
- NEVER invent. If a field is not legible, set it null AND add its name to "needsReview".
- If the image is neither a passport nor an ID card, or is unreadable, set all fields null and put "not_a_passport" in needsReview.

Schema (every key REQUIRED; null when absent):
{"passportNumber":str|null,"surname":str|null,"givenNames":str|null,"dateOfBirth":str|null,"dateOfIssue":str|null,"dateOfExpiry":str|null,"nationality":str|null,"nationalityCountry":str|null,"sex":"M"|"F"|null,"documentType":"passport"|"id_card"|null,"mrz":[str],"needsReview":[str]}`;

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

// ── Machine-readable zone, decoded in code ───────────────────────────────
// The model transcribes the "<<<" lines; this decodes them by position and keeps
// only fields whose ICAO check digit passes. The model's own reading of the MRZ is
// unreliable (it glued the check digit onto an ID card number and misread a birth
// date, 2026-11-20); a passing check digit is near-certain.
function mrzCheck(field: string, digit: string): boolean {
  const w = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < field.length; i++) {
    const c = field[i]!;
    const v = c === '<' ? 0 : /\d/.test(c) ? +c : /[A-Z]/.test(c) ? c.charCodeAt(0) - 55 : -1;
    if (v < 0) return false;
    sum += v * w[i % 3]!;
  }
  return String(sum % 10) === digit;
}
function mrzDate(yymmdd: string, kind: 'birth' | 'expiry'): string | null {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  const yy = +yymmdd.slice(0, 2), mm = yymmdd.slice(2, 4), dd = yymmdd.slice(4, 6);
  const nowYY = new Date().getUTCFullYear() % 100;
  const year = kind === 'birth' ? (yy > nowYY ? 1900 + yy : 2000 + yy) : 2000 + yy;
  return `${year}-${mm}-${dd}`;
}
function applyMrz(p: ParsedPassport, raw: unknown) {
  if (!Array.isArray(raw)) return;
  const lines = raw.map(l => String(l || '').toUpperCase().replace(/\s+/g, '').replace(/[«‹]/g, '<')).filter(l => l.length >= 28);
  let num: string | null = null, numChk = '', dob = '', dobChk = '', sex = '', exp = '', expChk = '', nat = '', names = '';
  if (lines.length >= 3 && /^[ACI]/.test(lines[0]!)) {          // ID card (3 × 30)
    const [l1, l2, l3] = lines as [string, string, string];
    num = l1.slice(5, 14); numChk = l1[14] || '';
    dob = l2.slice(0, 6); dobChk = l2[6] || ''; sex = l2[7] || ''; exp = l2.slice(8, 14); expChk = l2[14] || ''; nat = l2.slice(15, 18);
    names = l3;
    p.documentType = 'id_card';
  } else if (lines.length >= 2 && lines[0]!.startsWith('P')) {  // passport (2 × 44)
    const [l1, l2] = lines as [string, string];
    names = l1.slice(5);
    num = l2.slice(0, 9); numChk = l2[9] || ''; nat = l2.slice(10, 13);
    dob = l2.slice(13, 19); dobChk = l2[19] || ''; sex = l2[20] || ''; exp = l2.slice(21, 27); expChk = l2[27] || '';
    p.documentType = 'passport';
  } else return;
  if (num && mrzCheck(num, numChk)) p.passportNumber = num.replace(/</g, '');
  if (mrzCheck(dob, dobChk)) p.dateOfBirth = mrzDate(dob, 'birth');
  if (mrzCheck(exp, expChk)) p.dateOfExpiry = mrzDate(exp, 'expiry');
  if (sex === 'M' || sex === 'F') p.sex = sex;
  if (/^[A-Z]{3}$/.test(nat)) p.nationality = nat;
  const [sur, giv] = names.split('<<');
  if (sur && /^[A-Z<]+$/.test(sur) && !p.surname) p.surname = sur.replace(/</g, ' ').trim();
  if (giv && !p.givenNames) p.givenNames = giv.replace(/</g, ' ').trim();
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
              { type: 'text', text: 'Extract the fields from this travel document (passport or ID card).' },
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
    applyMrz(p, (p as any).mrz);
    delete (p as any).mrz;
    return { supported: true, extracted: p };
  } catch (e: any) {
    return { supported: true, extracted: null, error: String(e?.message || e) };
  }
}

// Fill-only DOB write: set Student.birthday from a parsed passport ONLY when the
// student has none yet (Neil, 2026-08-27). Never overwrites an existing birthday
// — every other passport field still waits for human confirm. Returns true if it
// wrote. UTC-midnight construction keeps the @db.Date column off the Dublin-summer
// one-day-early skew. Takes prisma as an arg so this module stays dependency-free.
export async function fillBirthdayIfEmpty(
  prisma: any,
  studentId: number,
  extracted: ParsedPassport | null,
): Promise<boolean> {
  const dob = extracted?.dateOfBirth;
  if (!studentId || !dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  const cur = await prisma.student.findUnique({ where: { id: studentId }, select: { birthday: true } });
  if (!cur || cur.birthday) return false;
  await prisma.student.update({ where: { id: studentId }, data: { birthday: new Date(dob + 'T00:00:00Z') } });
  return true;
}

/**
 * Booking-form parser engine (placement-agnostic).
 *
 * Two-stage, deliberately: a cheap deterministic text extraction first, then a
 * small LLM only to MAP that text onto our canonical fields. Partners send
 * wildly different layouts (their own ERP exports, our legacy PDF, etc.), so the
 * LLM earns its keep on the mapping/normalisation — but we never waste vision
 * compute reading a structured doc as an image.
 *
 *   Stage 1 — pdftotext -layout (poppler, already on the box) → plain text.
 *   Stage 2 — OpenAI (gpt-4o-mini by default) → canonical booking JSON whose
 *             field names + enum values mirror the partner-portal enrollForm,
 *             so the output drops straight into the existing enroll() flow.
 *
 * Output is for a HUMAN to confirm before submission — `needsReview` lists the
 * fields the model was unsure about (e.g. an ambiguous accommodation tick).
 *
 * No new npm deps: child_process for pdftotext, global fetch for OpenAI.
 */
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

const execFileP = promisify(execFile);
const OPENAI_MODEL = process.env.OPENAI_PARSER_MODEL || 'gpt-4o-mini';

export interface ParsedBooking {
  firstName: string | null; lastName: string | null;
  gender: 'male' | 'female' | 'non_binary' | null;
  dateOfBirth: string | null; email: string | null; phone: string | null;
  addressLine1: string | null; addressLine2: string | null;
  city: string | null; postCode: string | null;
  country: string | null; nationality: string | null;
  guardianName: string | null; guardianPhone: string | null; guardianEmail: string | null;
  passportNumber: string | null;
  visaRequired: boolean | null; visaType: string | null;
  englishLevel: 'beginner' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'unknown' | null;
  courseRawText: string | null;
  courseType: 'group' | 'exam' | 'private' | 'lifepass' | 'academic_year' | 'junior' | null;
  courseSlot: 'morning' | 'afternoon' | null;
  courseHours: number | null;
  examType: 'ielts' | 'fce' | 'cae' | null;
  courseStart: string | null; courseEnd: string | null; courseWeeks: number | null;
  accommType: 'none' | 'host' | 'apartment' | 'hostel_hotel' | null;
  accommRoom: string | null;
  accommStart: string | null; accommEnd: string | null;
  transferArrival: boolean | null; transferDeparture: boolean | null;
  allergies: string | null; specialPhysicalNeeds: string | null; specialLearningNeeds: string | null;
  notes: string | null;
  needsReview: string[];
}

// Stage 1 — PDF bytes → text. -layout preserves the label/value columns these
// forms rely on; without it the ticked-box markers drift away from their rows.
async function pdfToText(pdf: Buffer): Promise<string> {
  const tmp = path.join(os.tmpdir(), `bf-${crypto.randomBytes(8).toString('hex')}.pdf`);
  await fs.promises.writeFile(tmp, pdf);
  try {
    const { stdout } = await execFileP('pdftotext', ['-layout', tmp, '-'], { maxBuffer: 16 * 1024 * 1024 });
    return stdout;
  } finally {
    fs.promises.unlink(tmp).catch(() => {});
  }
}

// Field names + enum values below are kept identical to the partner-portal
// enrollForm so the result maps 1:1 onto the existing enroll() submission.
const SYSTEM_PROMPT = `You extract data from student booking/enrolment forms for ULearn (an English-language school in Dublin) into a FIXED JSON object. Forms arrive from many agencies in different layouts — map whatever you see onto the schema. Rules:
- Output ONLY the JSON object, no prose, no markdown fences.
- Dates: "YYYY-MM-DD". Convert dd/mm/yyyy. Blank / "TBC" / "N/A" → null.
- Booleans: a tick (✔/✓/X), highlight, or "YES" next to an option means true; "NO" means false; unclear → null.
- Enumerated fields: use ONLY an allowed value. If you cannot tell, set null AND add the field name to "needsReview".
- NEVER invent data. If it isn't on the form, null.
- Course mapping examples: "General English 20AM" → courseType "group", courseSlot "morning", courseHours 20. "Visa Premium"/"Academic Year" → "academic_year". "IELTS Morning" → courseType "exam", examType "ielts", courseSlot "morning".
- englishLevel: map "A1 (Elementary)" → "A1", "Absolute Beginner" → "beginner", "I don't know" → "unknown".
- "needsReview": list every field path you were genuinely unsure about (especially ambiguous ticks like accommodation room type).

Schema (every key REQUIRED; use null when absent):
{"firstName":str|null,"lastName":str|null,"gender":"male"|"female"|"non_binary"|null,"dateOfBirth":str|null,"email":str|null,"phone":str|null,"addressLine1":str|null,"addressLine2":str|null,"city":str|null,"postCode":str|null,"country":str|null,"nationality":str|null,"guardianName":str|null,"guardianPhone":str|null,"guardianEmail":str|null,"passportNumber":str|null,"visaRequired":bool|null,"visaType":str|null,"englishLevel":"beginner"|"A1"|"A2"|"B1"|"B2"|"C1"|"C2"|"unknown"|null,"courseRawText":str|null,"courseType":"group"|"exam"|"private"|"lifepass"|"academic_year"|"junior"|null,"courseSlot":"morning"|"afternoon"|null,"courseHours":15|20|30|null,"examType":"ielts"|"fce"|"cae"|null,"courseStart":str|null,"courseEnd":str|null,"courseWeeks":number|null,"accommType":"none"|"host"|"apartment"|"hostel_hotel"|null,"accommRoom":str|null,"accommStart":str|null,"accommEnd":str|null,"transferArrival":bool|null,"transferDeparture":bool|null,"allergies":str|null,"specialPhysicalNeeds":str|null,"specialLearningNeeds":str|null,"notes":str|null,"needsReview":[str]}`;

// Stage 2 — text → canonical JSON via OpenAI Chat Completions (json_object mode
// guarantees a parseable object; temperature 0 for determinism).
async function textToBooking(text: string): Promise<{ booking: ParsedBooking; usage: any }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Booking form text:\n\n${text}` },
      ],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 400)}`);
  }
  const data: any = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  let booking: ParsedBooking;
  try {
    booking = JSON.parse(content);
  } catch {
    throw new Error('OpenAI returned non-JSON content');
  }
  if (!Array.isArray((booking as any).needsReview)) (booking as any).needsReview = [];
  return { booking, usage: data.usage };
}

// Coerce a model value onto an allowed enum: exact match wins, else the first
// synonym whose keyword appears in the value. Returns undefined when it can't be
// mapped (caller nulls it + flags for review) so a bad value never reaches the form.
function coerceEnum(value: any, allowed: string[], synonyms: Record<string, string[]>): string | null | undefined {
  if (value == null || value === '') return null;
  const v = String(value).toLowerCase().trim();
  if (allowed.includes(v)) return v;
  for (const [canon, words] of Object.entries(synonyms)) {
    if (words.some(w => v.includes(w))) return canon;
  }
  return undefined;
}

const WEEK_MS = 7 * 24 * 3600 * 1000;
function weeksBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const d = (new Date(b).getTime() - new Date(a).getTime()) / WEEK_MS;
  return Number.isFinite(d) && d > 0 ? Math.round(d) : null;
}

// Safety net over the model output: guarantees enum fields hold a value the
// portal form accepts (or null + a review flag), and derives course/accom weeks
// from the dates when the form didn't state them.
function normalize(b: ParsedBooking): ParsedBooking {
  const review = new Set(b.needsReview || []);
  const apply = (field: keyof ParsedBooking, allowed: string[], syn: Record<string, string[]>, upper = false) => {
    const r = coerceEnum(b[field], allowed, syn);
    if (r === undefined) { review.add(field as string); (b as any)[field] = null; }
    else (b as any)[field] = r && upper && r.length === 2 ? r.toUpperCase() : r;
  };
  apply('accommType', ['none', 'host', 'apartment', 'hostel_hotel'], {
    host: ['host', 'homestay'], apartment: ['apartment', 'residence', 'flat', 'studio'],
    hostel_hotel: ['hostel', 'hotel'], none: ['none', 'own', 'self'],
  });
  apply('courseType', ['group', 'exam', 'private', 'lifepass', 'academic_year', 'junior'], {
    group: ['general', 'group'], exam: ['exam', 'ielts', 'cambridge', 'fce', 'cae'],
    private: ['private', 'one-to-one', '1-1', '1:1'], lifepass: ['lifepass', 'life pass'],
    academic_year: ['academic', 'visa premium'], junior: ['junior', 'teen'],
  });
  apply('courseSlot', ['morning', 'afternoon'], { morning: ['morn', 'am'], afternoon: ['after', 'pm'] });
  apply('gender', ['male', 'female', 'non_binary'], { female: ['female', 'girl', 'woman'], male: ['male', 'boy', 'man'], non_binary: ['non', 'nb', 'other'] });
  apply('examType', ['ielts', 'fce', 'cae'], { ielts: ['ielts'], fce: ['fce', 'first'], cae: ['cae', 'advanced'] });
  apply('englishLevel', ['beginner', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'unknown'], { beginner: ['beginner', 'absolute'], unknown: ["don't know", 'unknown', 'unsure'] }, true);

  if (b.courseHours != null) { const h = parseInt(String(b.courseHours), 10); b.courseHours = [15, 20, 30].includes(h) ? h : null; }
  if (b.courseWeeks == null) b.courseWeeks = weeksBetween(b.courseStart, b.courseEnd);

  b.needsReview = [...review];
  return b;
}

export async function parseBookingPdf(pdf: Buffer): Promise<{ booking: ParsedBooking; text: string; usage: any; model: string }> {
  const text = await pdfToText(pdf);
  if (!text.trim()) {
    throw new Error('No text extracted — the PDF may be a scanned image (OCR not wired up yet).');
  }
  const { booking, usage } = await textToBooking(text);
  return { booking: normalize(booking), text, usage, model: OPENAI_MODEL };
}

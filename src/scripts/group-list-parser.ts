/**
 * Group-list reader — the hard part of Group Management: turn an unpredictable,
 * unstructured partner student list (email body, pasted spreadsheet rows, CSV
 * text, Google-Sheet paste) into clean structured rows for SIS.
 *
 * Mirrors booking-parser.ts: OpenAI Chat Completions, json_object mode, temp 0.
 * Extraction only — the caller shows the rows for human review before anything
 * is written. Never invents data; unsure → null + a warning.
 *
 * LEVEL MAPPING (provisional — every group student re-sits placement anyway, so
 * this is only a starting bucket). Default used here (adjust once Neil confirms):
 *   basic / beginner            → A1
 *   elementary / pre-intermediate → A2
 *   low intermediate            → A2
 *   intermediate                → B1
 *   high / upper intermediate   → B2
 *   advanced                    → C1
 */

const OPENAI_MODEL = process.env.OPENAI_PARSER_MODEL || 'gpt-4o-mini';

export interface ParsedGroupStudent {
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  dob: string | null;        // YYYY-MM-DD
  age: number | null;
  levelRaw: string | null;   // partner's own words, verbatim
  levelCEFR: string | null;  // suggested CEFR (provisional)
  gender: 'male' | 'female' | null;
  nationality: string | null;
  notes: string | null;
}

export interface ParsedGroupList {
  students: ParsedGroupStudent[];
  warnings: string[];
  model: string;
  usage: any;
}

const SYSTEM_PROMPT = `You extract a structured list of STUDENTS from a language-school partner's message. The input is unstructured and formatting varies wildly per agency: it may be an email body, rows pasted from Excel/Google Sheets, CSV text, or a plain numbered/bulleted list. Names often carry accents (Portuguese/Spanish) — preserve them exactly.

Return ONLY a JSON object of this shape:
{"students":[{"fullName":str,"firstName":str|null,"lastName":str|null,"dob":"YYYY-MM-DD"|null,"age":int|null,"levelRaw":str|null,"levelCEFR":"A1"|"A2"|"B1"|"B2"|"C1"|"C2"|null,"gender":"male"|"female"|null,"nationality":str|null,"notes":str|null}],"warnings":[str]}

Rules:
- One object per student. Keep accents in names. Split fullName into first (first token) and last (the rest) unless obviously otherwise.
- dob: only if an explicit date of birth is present. Dates are almost always DD/MM/YYYY (day first). Output ISO YYYY-MM-DD.
- age: if an age is explicitly stated OR derivable from a DOB (as of today), give the integer; else null.
- levelRaw: the partner's own words for English level, verbatim, incl. typos (e.g. "high intermadiate", "básico"). null if none.
- levelCEFR: map levelRaw to CEFR using: basic/beginner→A1; elementary/pre-intermediate/"low intermediate"→A2; intermediate→B1; "high intermediate"/upper-intermediate→B2; advanced→C1; proficiency→C2. null if no level.
- gender: infer from the given name where reasonably clear (esp. PT/ES names), else null.
- nationality: only if stated.
- notes: anything else specific to that student (allergy, "needs to be with X", room preference).
- IGNORE non-student lines: greetings, signatures, the agent/sender, and adult group leaders/chaperones UNLESS they are clearly also a participating student.
- Never invent data. If a field is unclear, use null and add a short human-readable note to "warnings" (e.g. "Row 4: no DOB given").`;

export async function parseGroupList(rawText: string): Promise<ParsedGroupList> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  const text = (rawText || '').trim();
  if (!text) return { students: [], warnings: ['Empty input'], model: OPENAI_MODEL, usage: null };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Partner student list:\n\n${text.slice(0, 20000)}` },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 400)}`);
  }
  const data: any = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  let parsed: any;
  try { parsed = JSON.parse(content); } catch { throw new Error('OpenAI returned non-JSON content'); }

  // Age is computed deterministically from DOB (LLMs get date arithmetic wrong —
  // the model returned 12 for a 2011 DOB). Only fall back to the model's stated
  // age when there's no DOB. As-of-today; the review/commit step can re-age to
  // the course start for class placement (16+ → adult classes).
  const ageFromDob = (dob: string): number | null => {
    const d = new Date(dob + 'T00:00:00Z'); const now = new Date();
    if (isNaN(+d)) return null;
    let a = now.getUTCFullYear() - d.getUTCFullYear();
    const m = now.getUTCMonth() - d.getUTCMonth();
    if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) a--;
    return a >= 0 && a < 120 ? a : null;
  };

  const CEFR = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  const students: ParsedGroupStudent[] = (Array.isArray(parsed.students) ? parsed.students : []).map((s: any) => {
    const fullName = String(s.fullName || '').trim();
    const cefr = s.levelCEFR ? String(s.levelCEFR).toUpperCase().trim() : null;
    const dob = /^\d{4}-\d{2}-\d{2}$/.test(s.dob || '') ? s.dob : null;
    const llmAge = Number.isFinite(Number(s.age)) && Number(s.age) > 0 ? Math.round(Number(s.age)) : null;
    return {
      fullName,
      firstName: s.firstName ? String(s.firstName).trim() : (fullName.split(/\s+/)[0] || null),
      lastName: s.lastName ? String(s.lastName).trim() : (fullName.split(/\s+/).slice(1).join(' ') || null),
      dob,
      age: dob ? ageFromDob(dob) : llmAge,
      levelRaw: s.levelRaw ? String(s.levelRaw).trim() : null,
      levelCEFR: cefr && CEFR.has(cefr) ? cefr : null,
      gender: s.gender === 'male' || s.gender === 'female' ? s.gender : null,
      nationality: s.nationality ? String(s.nationality).trim() : null,
      notes: s.notes ? String(s.notes).trim() : null,
    };
  }).filter((s: ParsedGroupStudent) => s.fullName);

  return {
    students,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
    model: OPENAI_MODEL,
    usage: data.usage,
  };
}

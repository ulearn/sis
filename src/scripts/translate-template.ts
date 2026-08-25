// Machine-translate an email/document template into a target language via OpenAI.
//
// The model is told, in the strongest terms, to translate ONLY the human-visible
// text and to leave everything machine-significant untouched: {{tokens}}, HTML
// tags/attributes, URLs, and CSS. We round-trip subject + body in one call and
// get back JSON so there's no parsing of prose.
//
// English is the base/source (what staff edit). Mongolian is deliberately NOT a
// target — machine Mongolian isn't good enough (Neil, Jun 2026); it stays manual.

// code → English name of the language (used in the prompt + the editor chips).
export const TARGET_LANGUAGES: { code: string; name: string; rtl?: boolean }[] = [
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'fr', name: 'French' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic', rtl: true },
  { code: 'ja', name: 'Japanese' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ko', name: 'Korean' },
];

export const TARGET_BY_CODE: Record<string, { code: string; name: string; rtl?: boolean }> =
  Object.fromEntries(TARGET_LANGUAGES.map(l => [l.code, l]));

// Resolve a student's native-language code from their Student.language (a name
// like "Spanish") with a nationality fallback. Returns null if it isn't one of
// the supported targets — caller then falls back to the English base.
const LANG_NAME_TO_CODE: Record<string, string> = {
  spanish: 'es', italian: 'it', portuguese: 'pt', french: 'fr', russian: 'ru',
  arabic: 'ar', japanese: 'ja', german: 'de', chinese: 'zh', korean: 'ko',
};
const NAT_TO_CODE: Record<string, string> = {
  spain: 'es', mexico: 'es', argentina: 'es', chile: 'es', colombia: 'es', peru: 'es', venezuela: 'es', ecuador: 'es',
  italy: 'it', brazil: 'pt', portugal: 'pt', france: 'fr', russia: 'ru',
  'saudi arabia': 'ar', japan: 'ja', germany: 'de', china: 'zh', 'south korea': 'ko',
};
export function resolveLangCode(language?: string | null, nationality?: string | null): string | null {
  const lang = (language || '').trim().toLowerCase();
  if (LANG_NAME_TO_CODE[lang]) return LANG_NAME_TO_CODE[lang];
  const nat = (nationality || '').trim().toLowerCase();
  return NAT_TO_CODE[nat] || null;
}

const OPENAI_MODEL = process.env.OPENAI_TRANSLATE_MODEL || 'gpt-4o';

export interface TranslatedTemplate { subject: string; html: string; }

export async function translateTemplateContent(
  subject: string,
  html: string,
  langCode: string,
): Promise<TranslatedTemplate> {
  const lang = TARGET_BY_CODE[langCode];
  if (!lang) throw new Error(`Unsupported target language: ${langCode}`);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const system = [
    `You are a professional translator for ULearn English School (Dublin) student communications.`,
    `Translate the English content into ${lang.name}.`,
    `ABSOLUTE RULES — follow exactly:`,
    `1. Preserve every {{...}} template token EXACTLY as written. Never translate, reorder, space, or alter the text inside or around the braces (e.g. {{student.first_name}} stays {{student.first_name}}).`,
    `2. Preserve ALL HTML tags, attributes, inline styles, classes, and URLs byte-for-byte. Only translate human-visible text nodes and visible attribute text (alt, title, aria-label, placeholder).`,
    `3. Do NOT add, remove, or reorder any HTML elements. The structure must be identical.`,
    `4. Keep the warm, encouraging, clear tone of the original. Use natural, native phrasing — not a literal word-for-word translation.`,
    `5. Translate the subject line too.`,
    lang.rtl ? `6. This is a right-to-left language. Translate the text normally; do not add direction markers — the renderer handles direction.` : ``,
    `Return ONLY JSON: {"subject": "...", "html": "..."}.`,
  ].filter(Boolean).join('\n');

  const user = JSON.stringify({ subject: subject || '', html: html || '' });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`OpenAI ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data: any = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned no content');
  let parsed: any;
  try { parsed = JSON.parse(content); } catch { throw new Error('OpenAI returned non-JSON'); }
  return { subject: String(parsed.subject ?? ''), html: String(parsed.html ?? '') };
}

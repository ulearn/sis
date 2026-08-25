#!/usr/bin/env node
/**
 * fit-lang.js — per-cue, content-faithful, length-matched translation of the App-Guide SRT.
 *
 *   node .tools/fit-lang.js <de|tr|ru|ko|ja|zh|fr|es|it|pt>
 *
 * WHY per-cue: a batched whole-script translate re-optimises globally and BLEEDS content across
 * cue boundaries (cue N's translation ends up holding cue N+1's words) — which destroys the very
 * timing alignment we want. So each English cue is translated in ISOLATION (glossary-pinned for
 * consistent terminology) and fitted to a syllable/character BUDGET derived from the cue's real
 * duration, so the spoken translation takes ~the same time as the English.
 *
 * BUDGET: cross-linguistic speech-rate ratios (Pellegrino et al. 2011, syll/sec vs English 6.19).
 * budget_units = round(EN_syllables × ratio). Units are syllables for Latin/Cyrillic scripts,
 * characters for CJK (Han char ≈ 1 syllable, Hangul block ≈ 1 syllable, kana ≈ 1 mora).
 *
 * Reads  data/app-guide/srt/app-guide-EN.srt   (the word-aligned master)
 * Writes data/app-guide/srt/app-guide-<lang>.srt  +  data/app-guide/txt/app-guide-<lang>.txt
 */
const APP = '/home/sis/web/sis.ulearnschool.com/public_html/sis';
require(APP + '/node_modules/dotenv').config({ path: APP + '/.env', quiet: true });
const fs = require('fs');
const KEY = process.env.OPENAI_API_KEY;
const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const GUIDE = APP + '/data/app-guide';

const CFG = {
  es: { name: 'Spanish',              ratio: 1.26, count: 'latin',    note: 'Use "usted" (formal).' },
  it: { name: 'Italian',              ratio: 1.13, count: 'latin',    note: 'Use "Lei" (formal).' },
  pt: { name: 'Brazilian Portuguese', ratio: 1.20, count: 'latin',    note: 'Use "você" (Brazilian).' },
  fr: { name: 'French',               ratio: 1.16, count: 'latin',    note: 'Use "vous" throughout — NEVER "tu".' },
  de: { name: 'German',               ratio: 0.96, count: 'latin',    note: 'Use "Sie" (formal) — never "du".' },  // German syll-rate < English
  tr: { name: 'Turkish',              ratio: 1.05, count: 'latin',    note: 'Use the polite "siz" form.' },        // estimate (not in Pellegrino set)
  ru: { name: 'Russian',              ratio: 1.02, count: 'cyrillic', note: 'Use polite "вы".' },                  // estimate
  ko: { name: 'Korean',               ratio: 1.00, count: 'hangul',   note: 'Use polite -요/-습니다 speech.' },     // estimate; 1 block = 1 syllable
  ja: { name: 'Japanese',             ratio: 1.27, count: 'mora',     note: 'Use polite です/ます form.' },         // kana=1 mora, kanji≈1.8
  zh: { name: 'Simplified Chinese',   ratio: 0.84, count: 'han',      note: 'Use polite 您 where addressing the student.' }, // 1 hanzi = 1 syllable
};
const LANG = (process.argv[2] || '').toLowerCase();
if (!CFG[LANG]) { console.error('Usage: node fit-lang.js <' + Object.keys(CFG).join('|') + '>'); process.exit(1); }
const C = CFG[LANG];

// Glossary — keep these verbatim / consistent so terminology doesn't wobble cue-to-cue.
const GLOSSARY = `Keep these names/terms consistent and verbatim where marked:
- "Ulearn" (school name) — verbatim. "Neil" (presenter) — verbatim. "Dublin" — verbatim.
- "Leo"/"Leonardo the lion" — the mascot lion (translate "the lion", keep the name).
- "Kickstart" — the challenge name, verbatim. "Instagram", "FAQ" — verbatim.
- "non-EU students" — render as the local equivalent of "non-EU" consistently.
- "progress posts" = short student video posts; "placement test"; "social(s)" = social events;
  "ambassador code" = referral discount code. Use one consistent term for each throughout.`;

// ── counters ──────────────────────────────────────────────────────────────
function syllLatin(t){ return t.toLowerCase().split(/\s+/).filter(Boolean).reduce((n,w)=>{w=w.replace(/[^a-zàâäáãéèêëíìîïóòôöõúùûüÿœçñ]/g,'');if(!w)return n;let m=w.match(/[aeiouyàâäáãéèêëíìîïóòôöõúùûüÿœ]+/g)||[];return n+Math.max(1,m.length);},0); }
function syllCyr(t){ const m=t.toLowerCase().match(/[аеёиоуыэюяєії]/g)||[]; return m.length; }
function cntHan(t){ return (t.match(/[一-鿿㐀-䶿]/g)||[]).length; }
function cntHangul(t){ return (t.match(/[가-힣]/g)||[]).length; }
function cntMora(t){ const kana=(t.match(/[぀-ヿｦ-ﾟ]/g)||[]).length; const kanji=(t.match(/[一-鿿]/g)||[]).length; return kana + Math.round(kanji*1.8); }
const COUNT = { latin: syllLatin, cyrillic: syllCyr, han: cntHan, hangul: cntHangul, mora: cntMora }[C.count];

function syllEN(t){ return t.toLowerCase().split(/\s+/).filter(Boolean).reduce((n,w)=>{w=w.replace(/[^a-z]/g,'');if(!w)return n;let m=w.match(/[aeiouy]+/g)||[];let c=m.length;if(w.endsWith('e')&&c>1)c--;return n+Math.max(1,c);},0); }

function parseSrt(f){ const raw=fs.readFileSync(f,'utf8').replace(/\r/g,''); return raw.split(/\n\n+/).map(b=>b.trim()).filter(Boolean).map(b=>{const L=b.split('\n');return {n:+L[0], tl:L[1], text:L.slice(2).join(' ').trim()};}); }

async function chat(system, user, temp = 0.3) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:H,
    body: JSON.stringify({ model:'gpt-4o-mini', temperature:temp, response_format:{type:'json_object'},
      messages:[{role:'system',content:system},{role:'user',content:user}] }) }).then(r=>r.json());
  if (!r.choices) throw new Error('chat: ' + JSON.stringify(r).slice(0,200));
  return JSON.parse(r.choices[0].message.content);
}

const SYS = `You translate ONE subtitle cue at a time from English into ${C.name} for a warm, friendly student-app voiceover by ULearn English School.
RULES:
1. Translate ONLY the given English cue. NEVER add, borrow, or anticipate content from the previous or next cue — even if the sentence is cut mid-way, translate just this fragment (leave it grammatically open, like the English).
2. Natural spoken ${C.name}, warm and clear (formal-friendly register). ${C.note || ''}
3. Fit the SYLLABLE/CHARACTER BUDGET given — be concise, prefer shorter idiomatic phrasing over literal. Going under budget is fine; never blow past it.
${GLOSSARY}
Return JSON: {"t":"<translation>"}.`;

async function translateCue(en, budget, prevEn, nextEn, extraTight) {
  const u = `Previous cue (context only, DO NOT translate): "${prevEn||'—'}"
Next cue (context only, DO NOT translate): "${nextEn||'—'}"
>>> TRANSLATE THIS CUE ONLY <<<: "${en}"
Budget: at most ${budget} ${C.count==='latin'||C.count==='cyrillic'?'syllables':(C.count==='mora'?'mora':'characters')}.${extraTight?' This is a RETRY — you were over budget; make it clearly SHORTER.':''}`;
  const r = await chat(SYS, u, extraTight ? 0.2 : 0.3);
  return (r.t || '').trim();
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({length:limit}, async () => { while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); } }));
  return out;
}

(async () => {
  const en = parseSrt(GUIDE + '/srt/app-guide-EN.srt');
  const budgets = en.map(c => Math.max(3, Math.round(syllEN(c.text) * C.ratio)));
  console.log(`Fitting ${en.length} cues → ${C.name} (ratio ${C.ratio}, unit=${C.count})`);

  const results = await mapLimit(en, 6, async (c, i) => {
    let t = await translateCue(c.text, budgets[i], en[i-1]?.text, en[i+1]?.text, false);
    // up to 2 tighten retries if over budget
    for (let k = 0; k < 2 && COUNT(t) > budgets[i] + 1; k++) t = await translateCue(c.text, budgets[i], en[i-1]?.text, en[i+1]?.text, true);
    return t;
  });

  // write outputs
  let srt = '', txt = '';
  en.forEach((c, i) => { srt += `${c.n}\n${c.tl}\n${results[i]}\n\n`; txt += results[i] + ' '; });
  fs.writeFileSync(GUIDE + `/srt/app-guide-${LANG}.srt`, srt);
  fs.writeFileSync(GUIDE + `/txt/app-guide-${LANG}.txt`, txt.trim() + '\n');

  // report
  let over = 0, totE = 0, totT = 0, maxr = 0;
  en.forEach((c, i) => { const se = syllEN(c.text), st = COUNT(results[i]); totE += se; totT += st; const r = st/(se*C.ratio); if (r>maxr) maxr=r; if (st > budgets[i]+1) { over++; console.log(`  OVER cue ${c.n}: budget ${budgets[i]}, got ${st}  "${results[i].slice(0,50)}"`); } });
  console.log(`\n${C.name}: wrote srt/app-guide-${LANG}.srt + txt/app-guide-${LANG}.txt`);
  console.log(`  cues over budget: ${over}/${en.length}, max ratio-vs-budget ${maxr.toFixed(2)}`);
  // boundary spot-check
  [0,35,36,37,48].forEach(i => console.log(`  cue ${i+1}\n    EN: ${en[i].text.slice(0,60)}\n    ${LANG.toUpperCase()}: ${results[i]}`));
})().catch(e => { console.error(e); process.exit(1); });

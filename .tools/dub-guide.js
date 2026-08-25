#!/usr/bin/env node
/**
 * dub-guide.js — SRT → timeline-aligned dubbed audio via OpenAI (TTS + translate).
 *
 *   node .tools/dub-guide.js <langCode> [voice] [inputSrt]
 *   e.g. node .tools/dub-guide.js es marin
 *
 * Pipeline: parse SRT → merge Whisper fragments into SENTENCE cues → batch-translate
 * (context-aware) → TTS each cue → measure (ffprobe) → fit to the cue's time window
 * (concise re-translate if way over, then a capped ffmpeg time-stretch) → concat onto
 * the original timeline with silence gaps → write app-guide-<lang>.{wav,mp3}.
 *
 * OpenAI TTS has no SSML / rate control, so fitting = shorten text + modest atempo.
 */
const APP = '/home/sis/web/sis.ulearnschool.com/public_html/sis';
require(APP + '/node_modules/dotenv').config({ path: APP + '/.env', quiet: true });
const fs = require('fs');
const { execFileSync } = require('child_process');

const KEY = process.env.OPENAI_API_KEY;
const FFMPEG = APP + '/.tools/ffmpeg';
const FFPROBE = APP + '/.tools/ffprobe';
const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };

const LANG = (process.argv[2] || '').toLowerCase();
const VOICE = process.argv[3] || 'cedar';   // cedar = male (matches Neil); marin is female
const GUIDE = APP + '/data/app-guide';     // inputs + finished outputs live here
const INPUT = process.argv[4] || (GUIDE + '/app-guide-EN.srt');
const NAMES = { es: 'Spanish', pt: 'Brazilian Portuguese', it: 'Italian', fr: 'French', de: 'German', tr: 'Turkish', ru: 'Russian', ko: 'Korean', ja: 'Japanese', zh: 'Simplified Chinese' };
if (!NAMES[LANG]) { console.error('Usage: node dub-guide.js <es|pt|it|fr|de|tr|ru|ko|ja|zh> [voice]'); process.exit(1); }
const LANG_NAME = NAMES[LANG];

const SR = 24000;                 // OpenAI TTS mp3 is 24kHz — standardise everyone to it
const TEMPO_CAP = 1.15;           // max speed-up (≤15%) before we accept minor drift
const WORK = APP + '/tmp/dub-work-' + LANG;              // scratch — ephemeral, stays in tmp/
const OUT_WAV = GUIDE + '/app-guide-' + LANG + '.wav';
const OUT_MP3 = GUIDE + '/app-guide-' + LANG + '.mp3';

// ── helpers ──────────────────────────────────────────────────────────────
const t2s = (t) => { const [h, m, r] = t.split(':'); const [s, ms] = r.split(','); return (+h) * 3600 + (+m) * 60 + (+s) + (+ms) / 1000; };
const ff = (args) => execFileSync(FFMPEG, ['-y', '-loglevel', 'error', ...args]);
const dur = (f) => parseFloat(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());

async function chat(system, user, temp = 0.3) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: H,
    body: JSON.stringify({ model: 'gpt-4o-mini', temperature: temp, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  }).then((r) => r.json());
  if (!r.choices) throw new Error('chat: ' + JSON.stringify(r).slice(0, 200));
  return r.choices[0].message.content.trim();
}
async function tts(text, file) {
  const r = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST', headers: H,
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: VOICE, input: text, response_format: 'mp3', instructions: 'Warm, friendly, clear — a welcoming language-school guide. Natural conversational pace.' }),
  });
  if (!r.ok) throw new Error('tts ' + r.status + ' ' + (await r.text()).slice(0, 160));
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}

// ── 1. parse + merge into sentence cues ─────────────────────────────────
function sentenceCues(srt) {
  const raw = srt.split(/\r?\n\r?\n/).map((b) => {
    const L = b.split(/\r?\n/); const tl = L.find((x) => x.includes('-->')); if (!tl) return null;
    const [a, b2] = tl.split('-->').map((x) => x.trim());
    return { start: t2s(a), end: t2s(b2), text: L.slice(L.indexOf(tl) + 1).join(' ').trim() };
  }).filter(Boolean);
  const out = []; let cur = null;
  for (const c of raw) {
    if (!cur) cur = { start: c.start, end: c.end, text: c.text };
    else { cur.end = c.end; cur.text = (cur.text + ' ' + c.text).trim(); }
    if (/[.!?…]["')\]]?\s*$/.test(cur.text)) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out;
}

(async () => {
  fs.rmSync(WORK, { recursive: true, force: true }); fs.mkdirSync(WORK, { recursive: true });
  const cues = sentenceCues(fs.readFileSync(INPUT, 'utf8'));
  console.log(`[${LANG}] ${cues.length} sentence cues, voice=${VOICE}`);

  // 2. batch translate (context-aware, numbered) ---------------------------
  const numbered = cues.map((c, i) => `${i + 1}. ${c.text}`).join('\n');
  const sys = `Translate this app-guide voiceover into ${LANG_NAME}. Keep the SAME numbering, one line each. Natural, native, spoken register for a friendly school app guide. Keep each line's length close to the original so it fits the same timing. Return ONLY the numbered lines.`;
  const tr = await chat(sys, numbered);
  const map = {};
  tr.split(/\r?\n/).forEach((l) => { const m = l.match(/^\s*(\d+)[.)]\s*(.+)$/); if (m) map[+m[1]] = m[2].trim(); });
  cues.forEach((c, i) => { c.tr = map[i + 1] || c.text; });

  // 3–5. per-cue TTS → measure → fit --------------------------------------
  let drift = 0;
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i]; const allowed = Math.max(0.4, c.end - c.start);
    const mp3 = `${WORK}/c${i}.mp3`; const wav = `${WORK}/c${i}.wav`;
    await tts(c.tr, mp3); let d = dur(mp3);
    // way over → ask for a shorter rendering once
    if (d > allowed * 1.25) {
      const words = Math.max(3, Math.round(allowed * (LANG === 'ja' || LANG === 'zh' || LANG === 'ko' ? 4 : 2.4)));
      c.tr = await chat(`Rewrite this ${LANG_NAME} sentence more concisely (≤ ~${words} words) keeping the meaning, natural spoken ${LANG_NAME}. Return ONLY the sentence.`, c.tr, 0.4);
      await tts(c.tr, mp3); d = dur(mp3);
    }
    // fit: convert to std wav, time-stretch (capped) if still over
    let tempo = 1;
    if (d > allowed) tempo = Math.min(d / allowed, TEMPO_CAP);
    ff(['-i', mp3, '-filter:a', `atempo=${tempo.toFixed(4)}`, '-ar', String(SR), '-ac', '1', wav]);
    c.wav = wav; c.dur = dur(wav);
    if (c.dur > allowed) drift += c.dur - allowed;
    process.stdout.write(`  cue ${i + 1}/${cues.length}: allow ${allowed.toFixed(1)}s → ${c.dur.toFixed(1)}s${tempo > 1 ? ` (x${tempo.toFixed(2)})` : ''}\r`);
  }
  console.log('\n  total residual drift:', drift.toFixed(2) + 's');

  // 6. assemble onto the timeline with silence gaps -----------------------
  const parts = []; let cursor = 0; let si = 0;
  const silence = (len) => { const f = `${WORK}/s${si++}.wav`; ff(['-f', 'lavfi', '-t', len.toFixed(3), '-i', `anullsrc=r=${SR}:cl=mono`, f]); return f; };
  for (const c of cues) {
    const gap = c.start - cursor;
    if (gap > 0.03) { parts.push(silence(gap)); cursor += gap; }
    parts.push(c.wav); cursor += c.dur;
  }
  const list = `${WORK}/list.txt`;
  fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-ar', String(SR), '-ac', '1', OUT_WAV]);
  ff(['-i', OUT_WAV, '-b:a', '128k', OUT_MP3]);
  console.log(`\n✓ ${OUT_WAV}  (${dur(OUT_WAV).toFixed(1)}s)`);
  console.log(`✓ ${OUT_MP3}`);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });

# Multilingual Video Dubbing — SRT-Timed Workflow

> **Scope note:** this is really **content-creation** and ultimately belongs on the main CMS
> site (a "Claude on the website" concern). It lives here because the **App Explainer / Student
> Guide video** needed it first. Treat this as the canonical recipe; port to the CMS later.

**One-line idea:** you can't just translate a script and re-narrate — translations run *longer*
and drift out of sync with the video. The fix is to carry **timing** through the whole chain via
an SRT, so every translated line is fitted back into the *original* time slot.

```
English MP3  →  Whisper  →  Timed SRT  →  Timed Translation  →  TTS  →  Translated narration
                            └──────────── the timing is what makes it scalable ────────────┘
```

---

## Why lip-sync isn't needed
The presenter is only shown in a small **picture-in-picture** window; the bulk of the frame is
**screen recordings**. So the video itself never changes — we only **swap the narration audio**.
That's the whole reason this cheap TTS-dub approach is viable here.

## The workflow (concept)

1. **Master** — produce the English video in Premiere; export the narration as **MP3/WAV**.
2. **Transcribe** — Whisper the audio → **SRT** (timestamped cues). *(Whisper JSON with word
   timestamps is even better for tight alignment.)*
3. **Translate the SRT** — into the target language, **preserving the original cue timings**.
   - The AI **rewrites concisely** so each translated cue **fits its time window**.
   - Prefer **shorter wording over speaking faster**.
4. **TTS** — feed **only the translated cue text** into the TTS engine; produce one clip (or a
   continuous track) matching the cue timings; nudge speaking speed only if needed.
5. **Assemble & replace** — drop the translated narration in place of the English; the video is
   otherwise identical.

## The implemented toolchain (what actually exists in this repo)

Everything runs from OpenAI (already wired) + a local static ffmpeg. No new services.

| Step | Tool | Detail |
|---|---|---|
| ffmpeg/ffprobe | `sis/.tools/ffmpeg`, `.tools/ffprobe` | static build, no sudo (measure duration, `atempo` stretch, concat) |
| Transcribe | OpenAI `whisper-1`, `response_format=srt`, `language=en` | pin the language to avoid mis-detect |
| Translate | OpenAI `gpt-4o-mini` | batched, numbered cues; system prompt says *"keep each line close to the original length so it fits the same timing"* |
| TTS (default) | OpenAI `gpt-4o-mini-tts`, voice **`cedar`** (male) | per-cue generate → measure → fit |
| Fit-to-cue | concise re-translate if >1.25× over, then `atempo` (cap ~1.15) | shorten text first, stretch second |
| Assemble | ffmpeg concat with silence gaps at each `cue_start` | outputs timeline-aligned WAV+MP3 |

**The pipeline script:** `sis/.tools/dub-guide.js`
```
node .tools/dub-guide.js <es|pt|it|fr|de|tr|ru|ko|ja|zh> [voice]
# reads  data/app-guide/app-guide-EN.srt
# writes data/app-guide/app-guide-<lang>.{wav,mp3}   (scratch in tmp/dub-work-*)
```

**File homes** (all under `sis/data/app-guide/`):
- `srt/app-guide-<lang>.srt` — timed subtitles per language (`app-guide-EN.srt` = master)
- `txt/app-guide-<lang>.txt` — the **length-matched script**, paste-ready for ElevenLabs
- `app-guide-<lang>.{mp3,wav}` — the finished cedar dub, timeline-aligned

## Two provider routes (pick per language)

**A. OpenAI cedar (default, fully automated):** `dub-guide.js` generates + fits each cue → tight
alignment (<1.6s residual drift observed), consistent, but not the presenter's voice. Scrutinise
**Japanese/Russian** accents — the likely Azure candidates if they sound foreign.

**B. ElevenLabs (presenter's own cloned voice):** better voice, more work.
- **Do NOT** paste a fresh translation — feed the **length-matched `txt/app-guide-<lang>.txt`** we
  generate from the SRT (its wording is already trimmed to the cue lengths). A raw translation is
  wordier and drifts badly.
- ElevenLabs voice **speed ≈ 1.13** works well for **Romance languages**.
- If the finished track feels rushed, **slow it 95–98% in Premiere** — restores natural cadence
  while staying inside the original timings.
- **Gotcha:** a *single continuous* ElevenLabs track + a global stretch only matches **total
  length**, not per-cue timing → it drifts ("always behind"). For true alignment you must go
  **per-cue**.
- **Best long-term path:** swap the TTS step in `dub-guide.js` from OpenAI → the **ElevenLabs API
  (cloned voice), per cue** — then you get the presenter's voice *and* automatic per-cue
  alignment across all languages. Needs an ElevenLabs API key + voice ID.

## App-side wiring (how the right video reaches the right student)

- Per-language YouTube video IDs live in `WELCOME_VIDEOS` in `public/student.html`.
- Language is resolved by **`ChallengeI18n.resolve(Student.language, nationality)`** (mother tongue,
  else nationality → language via the canonical hub lang-map), English as fallback.
- **YouTube caveat:** you **cannot** select an embedded video's dub/audio-track via URL param or the
  IFrame API (only captions: `cc_lang_pref`/`hl`). So each language must be its **own uploaded
  video** with a distinct ID — a single multi-audio YouTube upload can't be targeted from an embed.

## ⚠️ Timing corrections (2026-07-28) — read before regenerating any language

Two drift sources were found and fixed. Both matter; the second is the bigger one.

**1. The English master SRT drifted.** whisper-1's `response_format=srt` gives *segment*-level timings
that run progressively AHEAD of the real speech (≈+2.5s mid-file) and pad the **final cue** with a
**~5.2s phantom tail** (last word "bye" ends at 281.76s but the SRT cue ran to 286.9s). Re-running
whisper is **deterministic** (byte-identical SRT, same md5) — so the fix is NOT to re-transcribe, it's
to rebuild cue timings from **word-level** timestamps:
`verbose_json` + `timestamp_granularities[]=word`, then set each cue's start/end from its actual
words (char-content aligned). The word-aligned master is now `srt/app-guide-EN.srt`
(old segment version backed up `…EN.srt.pre-wordalign.bak`).

**2. The translated SRTs weren't length-matched — and a batched translate BLEEDS content across cues.**
A whole-script translate re-optimises globally and shifts content between cues (cue N's translation
ends up holding cue N+1's words) → alignment destroyed even if syllable counts look fine. Also
translations are naturally *longer* than English and overflow their windows.

**Fix = `.tools/fit-lang.js`** (`node .tools/fit-lang.js <lang>`): translates **one cue at a time**
(isolated → no bleed; glossary-pinned → consistent terminology; register-pinned per language) and
fits each to a **syllable/character budget** = `round(EN_syllables × rate_ratio)`, where the ratio is
the target language's speech rate ÷ English (Pellegrino et al. 2011). Units: **syllables** for
Latin/Cyrillic (vowel-group count), **characters** for CJK (Han char ≈ 1 syllable, Hangul block ≈ 1,
kana ≈ 1 mora / kanji ≈ 1.8). Writes `srt/app-guide-<lang>.srt` + `txt/app-guide-<lang>.txt`.

Rate ratios (vs EN): es 1.26 · it 1.13 · pt 1.20 · **fr 1.16** · de 0.96 · tr 1.05 · ru 1.02 ·
ko 1.00 · ja 1.27 · zh 0.84. **tr/ru/ko/ja are estimates** (not in the Pellegrino set) — tune them.
Known first-pass wobbles: **ko** comes out too terse (ratio ~0.72, may drop nuance — raise its ratio);
**ja** runs long (mora estimate rough — lower ratio or refine mora counting). es/it/pt were hand-edited
already — do NOT regenerate them.

## Known limits / notes
- OpenAI TTS has **no SSML / no precise rate control** — fitting = shorten text + modest `atempo`.
- Whisper SRT segment timings DRIFT (see above) — rebuild from **word** timestamps, never trust the raw SRT cue ends.
- `data/app-guide/` is server-only (not web-served); `public/launch/` copies are temporary listen-links.

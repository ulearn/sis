# Student-app translation (i18n) — how it works + how to scale it

_Parked 2026-06-28. Phase 1 (KickStart €500 challenge + leaderboard) is BUILT and live. This doc explains the mechanism and the plan for going app-wide._

## How the translation works (it's a STATIC display layer)

Not on-demand machine translation. Each string was translated **once** (by the AI) and baked into a dictionary file. At runtime there is **no translation happening** — a helper just looks up the pre-written string for the resolved language and drops it into the UI.

- **Dictionary:** `public/challenge-i18n.js` — `window.ChallengeI18n` exposes:
  - `T` = `{ en:{key:str}, pt:{…}, es:{…}, … }` (the phrasebook; English is the fallback).
  - `render(lang, key, vars)` — looks up `T[lang][key]` (falls back to `T.en[key]`), interpolates `{n}/{date}/{target}` placeholders.
  - `resolve(language, country)` — **picks the UI language** (see below).
  - `flagFor(country)` / `nativeFlag(language, country)` — flag emoji for the toggle.
- **In `public/student.html`:**
  - `tr(key, vars)` — the call site helper (named `tr`, NOT `t`, because `t` is the leaderboard `.map(t => …)` param).
  - `_challengeLang` — active language; set on me()-load via `initChallengeLang(student)`; localStorage override (`challengeLang`).
  - `challengeLangToggle()` — renders the native-flag ⇄ 🇬🇧 pills; `setChallengeLang(code)` persists + re-renders (`loadChallenges()`).
  - `<script src="/sis/student/public/challenge-i18n.js">` loaded in `<head>`.

**Consequence:** when copy changes, the translation must be **re-added** to `challenge-i18n.js` by AI/dev. There is no auto-translation of new text. (This is standard i18n and the right call — fast, free at runtime, offline-safe.)

## Language resolution (uses the canonical lang-map)

`resolve(language, country)`:
1. `Student.language` first (English names: "Portuguese"→`pt`). `LANG_BY_NAME`.
2. **else nationality → language** via `COUNTRY_LANG` — inverted from the canonical hub `hubapp/scripts/ai-email/lang-map.json` (the same mapper that groups Spain/Mexico/Argentina/Chile/Colombia/… → Spanish).
3. else English.

This fallback matters: **~24% of students have blank `Student.language`**, and Spain carries regional tags (Catalan/Galician) — without step 2 a blank-language Mexican would wrongly get English. Flag = student's own nationality flag, else the language's default flag (`LANG_FLAG`, PT→🇧🇷 as most are Brazilian), else 🌐.

**Languages (Phase 1):** PT ES IT FR DE TR JA KO ZH RU + EN. **Arabic & Ukrainian deliberately skipped** (Arabic = RTL layout work, deferred).

**Caveats:** translations are machine-drafted — native-check **JP/KO/ZH/RU** before a wide rollout. Dates still render `en-IE` format.

## Scope today vs the ask

- **Done (Phase 1):** the €500 challenge "Progress Posts" card + the leaderboard card — banner, "Your Post Must" rules, post states, countdown/reading/thanks sheets, metric labels, leaderboard text.
- **NOT done:** the rest of the app (Profile, the other 5 challenge cards, Learning, Social/Activities, Messages, FAQ, tab/nav names) is still English.

## Going app-wide — the plan (Phase 2+)

Technically NOT hard — the infra (`tr()` + dictionary + `resolve()` + flag) extends anywhere. The real costs:
1. **Volume** — challenge area was ~30 strings; whole app is many hundreds × 10 langs = thousands of entries.
2. **Maintenance tax** — every copy tweak anywhere needs re-translating ×10.
3. **Dynamic/staff-written content does NOT fit the static model** — Messages, activity descriptions, FAQ answers, AI lesson content change at runtime, so they can't be pre-translated into a dictionary. Those need "leave English" or a live machine-translate (a different mechanism).

**Recommended (the "chrome" approach — best value):**
- **Phase 2 (high value, modest effort):** translate only the app skeleton — tab/nav names, section + card **headers**, the progress strip, key buttons (~40–60 stable strings). That's what makes the app *feel* native ("Perfil · Desafíos · Aprender", "Tu progreso", card titles) for ~20% of the effort. Long-form/body text stays English.
- **Phase 3 (optional):** the rest of the static labels (profile field labels, challenge card bodies). Skip long-form/dynamic.

**Structural change for app-wide:** move the language toggle from the Progress Posts card to a **single global spot** (app header / settings row) so it applies everywhere, not per-panel.

## To extend (cookbook)
1. Add the new strings as keys to **every** language block in `challenge-i18n.js` (rename the file to `app-i18n.js` if it outgrows "challenge").
2. Replace the hardcoded strings in `student.html` render functions with `tr('key', vars)`.
3. For app-wide, hoist the toggle to the header and call the re-render of whatever surface changed.
4. Static file — no build/restart; just reload the app (it loads the live server page).

# AutoNudge "Cascade" — timed, tiered host outreach

**Status:** backend + visual UI built 2026-07-31 (Neil/Kelly). Sending/cron = follow-up.

## Why (background)
The host portal + outreach works — hosts claim students well. But blasting **every** host at once is too low-resolution and produces **false positives**:
- A host claims a student but **isn't Garda-vetted** (or our records don't show it) — unusable, especially with an inspection due.
- A host claims a student then says "actually I'm not sure I want to host" — took the student off everyone else for nothing.

The Garda-vetting confirmation gap is the biggest issue: **only ~15 hosts show GV in SIS, not ~100** — many are in fact vetted (vetting is a central 2-yr Garda registration reusable across schools; hosts often work with several schools) but it isn't recorded here yet. So we can't just send to everyone.

## The idea
Release the nudge in **waves that cascade down the quality tiers** until students are claimed — highest-confidence hosts first:
1. **Batch 1 — GV Complete** (safe to use now), best **Level** first.
2. **Batch 2 — GV in progress** (Form/Upload).
3. **Batch 3 — No GV** (last resort).

Within/across waves, **PreMatch on Attributes** filters to hosts whose accepted **age band** (Jun <18 · Adult 18–29 · Mature 30+) and **gender** overlap an actually-unplaced student — no point emailing a junior-only family about a 40-year-old man.

**Auto-stop:** every wave gates on the **live unplaced pool** (same gate as host-outreach). As students are claimed the pool shrinks; when it hits 0, waves send nothing. Cascade halts itself.

## Wave spec (seed — send times editable in the UI)
Wave 1 sends at the normal AutoNudge start; ~3–4h between waves.

| Batch | Wave | GV | Level | PreMatch | Send |
|---|---|---|---|---|---|
| 1 GV Completed | 1 | Complete | Interested | Yes | Mon 08:00 |
| 1 | 2 | Complete | Regular | Yes | Mon 12:00 |
| 1 | 3 | Complete | Regular | Yes +unset | Mon 15:00 |
| 1 | 4 | Complete | BusyBee/SuperHost | Yes | Mon 18:00 |
| 2 GV In-Progress | 1 | Form/Upload | Sleeper/Interested/Regular/Busy/Super | Yes | Tue 08:00 |
| 2 | 2 | Form/Upload | Any | Yes +unset | Tue 12:00 |
| 3 No GV | 1 | None | Any | Yes +unset | Tue 15:00 |

`+unset` = at barrel-bottom, also email hosts with **no attribute data** (can't rule them out). (Note: B1 W2 & W3 both target Regular in Neil's spec — likely intentional staggering; edit in the UI if not.)

## Implementation
- **Config + resolver:** `src/scripts/auto-nudge.ts` — waves seeded in `DEFAULT_WAVES`, editable fields (time/enabled) persisted to `data/auto-nudge.json`. `getWaves()` returns each wave + `rawCount` (GV+Level match) and `matchedCount` (after PreMatch), plus the live `pool` and `sendableHosts`.
- **Host phase** = `vettingStatus` override else weakest-link over `vettingSubmissions` (None/Form/Upload/Complete). See [[project_host_garda_vetting]].
- **Attributes** = `accepts_juniors/adults/mature/male/female` on `accommodation_providers`. See [[project_host_categories]].
- **Routes:** `GET /sis/api/accommodation/auto-nudge/waves`, `PATCH .../auto-nudge/wave/:id {time,enabled}`.
- **UI:** purple **⚡ Auto Nudge** button on the Host Families topbar → overlay (`openAutoNudge()` in admin.html): live pool banner, batches→waves table with editable send-time inputs, enable toggles, and matched/raw host counts.
- **Send loop:** reuse `runHostOutreach` scoped to a wave's host set. **NOT built yet** — the UI is the "set-it-and-see-it" surface Neil asked for first.

## Auto-stop (CRITICAL — the whole point)
**The instant a student is placed, ALL comms for that student stop.** The send loop MUST re-check the live unplaced pool **before every wave**, and ideally **before every individual send** within a wave — the moment a claim lands, cancel the rest. Why it matters: email is a *passive* channel (no intraday response expectation), so the always-available hosts (retired / email-as-phone-notification — "the Adele McDonalds") claim within seconds and **busy hosts are never reached** if we blast everyone. The cascade + hard-stop exist to *spread students around* before they reach the fast-responders. (Manually removing an over-active host from rotation is possible too, but that's a manual step — the automation should pre-empt it.)

## Open / follow-up
1. **Actual sending** per wave (scope `runHostOutreach` to the wave host set, per `template`) + a **cron** firing each enabled wave at its time, gated on the live pool (see Auto-stop).
2. **Two email templates** to author: `host-cascade-standard` and `host-cascade-gv-reminder` ("…we have yet to receive your completed Garda Vetting Form. If you wish to proceed please fill it out on your Portal [host's own portal link]"). GV-reminder ONLY where vetting isn't done on the host's end (None/Form); Upload/Complete = standard (ball's in OUR court to submit to NVB/Garda — do NOT nag).
3. **Uncategorised-GV-Complete gap:** Batch 1 is Level-specific but most GV-Complete hosts have no Level → they land in no Batch 1 wave (only no-attribute ones fall to Batch 4 W1). Decide: add a Batch 1 "any remaining Level" sweep wave, or leave.

## Channels roadmap (Neil, 2026-07-31)
Structural problem: **email is passive** — most hosts don't see it intraday, so fast-responders win. A host literally asked today "can you SMS me instead, then I'd see it."
- **Phase 1 — Email (LIVE).** Working; cheap. Keep unless volume justifies more.
- **Phase 2 — SMS.** Could launch soon. Underrated — people READ SMS *because* everyone moved to WhatsApp. Keep volume MINIMAL (never 150 — only the matched wave subset). ~€0.04–0.08/msg to IE mobiles (Twilio/Bird). Needs an SMS-capable number (existing Twilio may be voice-only) or alphanumeric sender ID; doable via Bird. Build only if email stops sufficing — no revenue driver yet.
- **Phase 3 — WhatsApp.** Bigger lift. The emergency/comms number's WhatsApp is tied to a physical handset (WhatsApp Business ~4–5 logins but needs handset QR scan) → can't decentralise to remote workers. Plan: fold into the **Bird architecture** (WhatsApp Business API via Bird's app), possibly AI — but ~70% of issues ("lost in Dublin", "leak in bedroom", "tripped the fuses") aren't AI-solvable, so AI may be more hassle than help for emergency support. Wholesale change; deferred (not enough sales volume yet).

## Terminology
**"Cascade"** = the whole scheme; **"PreMatch"** = the attribute-match step; **"Attributes"** = age + gender; **"Level"** = host activity Level (renamed from Category).

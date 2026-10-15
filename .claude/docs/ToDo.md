# SIS — ToDo

Open work for this project. Protocol: anything left unfinished at the end of a session goes here (not in memory); finished work is moved to ToDo-Done.md. Synced with Wrike (space "hub" → folder "SIS") every 10 minutes — edit the text here; status syncs both ways.

## Rotate credentials exposed in SIS git history

**Priority:** High
**Status:** Backlog
**Added:** 2026-10-10

Two secrets were committed to GitHub history before being untracked (`.env.bak-slack-1786991371`, `zoho-tokens.json`). Untracking only stops future exposure. (from Claude memory: project_git_hygiene.md)
  - [ ] Rotate Zoho OAuth tokens
  - [ ] Rotate everything in the old `.env` backup (DB creds, API keys, Slack token)
  - [ ] Decide on a history scrub (BFG / filter-repo), optional and heavier
  - [ ] Decide on cleanup of `uploads/` (student PII) and `data/contracts/`, which are still tracked in history (gitignored only going forward)

---

## Decide the Fidelo gross-vs-net booking-fee cleanup (Jan 2025+)

**Priority:** High
**Status:** Waiting — Neil (algorithm decision)
**Added:** 2026-06-04

474 Fidelo bookings with ~€388k drift between the gross course rack-rate (`booking_course.fee`) and the net amount banked (`booking.amount_total`). Two algorithm candidates documented; decision pending. **2025 year-end accounts depend on this.**
Spec: `.claude/docs/ToDo/fidelo-gross-net-cleanup.md`

---

## Finish the post-Fidelo migration cleanup (duplicates + course naming)

**Priority:** Medium
**Status:** Waiting — Neil (true figures for the payment-differs pairs; course-name dictionary)
**Added:** 2026-06-03

Post-Fidelo backfill cleanup. Specs in `.claude/docs/MigrationCleanup/`.
  - [ ] **Duplicates** (`MigrationCleanup/dupes.md`): booking/payment reconnect — 83 done, 11 left, all "payment differs", waiting on Neil's true-figure call. Also unassigned-pool escrow/shadow flips and literal duplicate students. Forward-facing urgent cohort list: `.claude/docs/dup-bookings-urgent.md`.
  - [ ] **Course naming** (`MigrationCleanup/course-canon.md`): Fidelo course names → canonical "General English…". Recipe and mapping locked, parked ready to run (in lockstep: ILEP deriver Sets + `isRenewal=true` on renewals + webhook source). 93.7% of affected rows are historical, so low current-ops impact.
  - [ ] Neil to supply canonical names for the ~89 non-AY course families (Morning General, IELTS, Junior, etc.) (from Claude memory: project_course_canon.md)

---

## Clean up remaining duplicate payments from the June backfill (HS_ALSO + MESSY)

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-06-05

The 3 June 2026 backfill double-recorded payments. The SAFE bucket is done (28 bookings, €25,304). Check first whether the later 2026 backfill/recon work already covered these. (from Claude memory: project_payment_dedup.md)
  - [ ] HS_ALSO (3 bookings, €7,746): SIS dedup + HubSpot `commerce_payment` cleanup (otherwise a webhook re-fire re-inflates)
  - [ ] MESSY (21 bookings, €15,348), case by case: missing payments where bank > SIS (Arthur #1384, Bruno #1353, Amanda #1385, Ivo #1463, Maria Eduarda #1559, Federico #18043); multi-system messes (Tania #1514, Flávia #1534, Laura #1522, Lucas #1493, Mickaela #1375, Bernardo #49)

Truth source = hub `hubapp/Docs/MigrateRecon/recon-task-FULL.csv`. Dedup = merge, not delete.

---

## Set the CES exam-registration address and plan Exam Booking phase 2

**Priority:** Medium
**Status:** Waiting — Neil (verified CES address)
**Added:** 2026-10-13

Exam Booking module is live in the app, but CES sends are held (requests sit at REQUEST_PENDING) until a verified CES exam-registration address is set in admin → Examinations → Settings. Never use a general enquiries address. (from Claude memory: project_exam_booking.md)
  - [ ] Neil sets the verified CES address
  - [ ] Phase 2 (not built): LanguageCert / A1–A2 exam, IELTS Academic, automatic parsing of CES confirmation emails, pre/post-exam student reminders, HubSpot deep-link
  - [ ] Confirm regulatory date rules (8-month permission, result lead time, 3-year retention) against verified ILEP/TrustEd/ISD wording. They are configurable/soft for now.
  - [x] 2026-10-14 — realigned the picker logic to the KB (`kb/courses/academic-year/Exam-Renewal-Protocol.md` + `Exam-Student-FAQ.md`) after Neil's #97 test showed only 1 exam on 1 date (`src/scripts/exams.ts`, student.html picker). Root causes + fixes: (1) outer date limit was `courseStart+35w − 8w result-lead` applied as a HARD cut (~2-week window) — the KB explicitly says NOT course+35w; now uses the student's ACTUAL permission expiry (`Student.visaUntil`, course+35w only as fallback) and no longer subtracts the lead, so #97's window went 14 days → 10 weeks (1 → 34 dates). (2) Only the single level-aligned Cambridge exam was offered; IELTS General Training (207 loaded sittings, a KB-listed approved exam) is now offered alongside it at all levels. (3) Result-turnaround is now SOFT (warn + rank + allow per §3/§12) with per-exam figures from the KB table (IELTS ≤1wk, Cambridge digital ~2wk): a date is marked not-suitable ONLY if results genuinely land after permission expiry; a gentler note flags the renewal-prep buffer zone. Student picker now labels each date with its exam + shows the amber warning.
  - [ ] Neil to confirm two judgement calls made in that realignment: (a) IELTS offered at ALL levels (not gated B1+) since it's band-scored and sat months later — re-gate if you disagree; (b) the 8-week `resultLeadWeeks` is now a soft renewal-prep buffer (admin Settings tunable), not a hard cut — on the tight course+35w fallback it still flags most dates, but real students with a recorded `visaUntil` get a wider window. Backfilling `visaUntil` for AY students would sharpen this.
  - [x] 2026-10-14 — payment-arrangement V1/V2 (Neil): V1 (live default) = ULearn settles with CES for EVERY student, because they've already paid us (exam bundled or an EXAM_FEE extra). The old code branched `hasExamFee ? PREPAID : DIRECT`, which is really V2 and would have told the 2,129 AY bookings with NO itemised EXAM_FEE extra (incl. 52 of 132 currently running) to pay CES directly despite having paid — now gated behind `directPayEnabled` (exam-config, default OFF). Admin → Examinations → Settings has a "Student Pays Centre When No Exam Fee On Booking (V2)" toggle. `src/scripts/exams.ts` + `src/lib/exam-config.ts` + admin Settings. tsc 0, restarted.
  - [ ] V2 gate is an EXTRAS AUDIT, not a time-wait (Neil, 2026-10-14: "there is no impediment to V2 — I just didn't turn it on as it first requires an audit of the Extras"). Before flipping `directPayEnabled`, audit whether exams are properly recorded in the Extras section: are EXAM_FEE extras present/consistent on the bookings that actually prepaid, and absent on the no-charge cohort? V2 branches on exactly that flag, so if the extras are misaligned V2 will mis-bill. Check the exam line is aligned in that section, then flip.

---

## Carlotta Butti #70 — Capel Street extension invisible + €800 unreconciled

**Priority:** High
**Status:** Waiting — Kelly (which room now) + accounts (€800)
**Added:** 2026-10-14

Kelly (accomm@, Slack 2026-10-13) flagged Carlotta extended at Capel Street but "doesn't show up in SIS." Diagnosed: she IS in SIS (student #70). Her extension is booking **18357** (HubSpot deal 524720509127, HS invoice 1388324376805), status PENDING, 2026-10-10 → 2027-02-20, 17 wks, €3,400 total, **€0 paid**. Two breakages:
  - [ ] **Unassigned bed.** Extension accommodation placement #11438 was created with `bedId = null`, so she's on no room / no occupancy board. Her original bed 87 (A2/Room 2, Superior, booking 76, ended 2026-10-10) then read as empty and was reassigned — Michele Mancini (1 night) then **Sandrine Bruneau 2026-10-11 → 2026-11-01**. So in SIS she occupies no bed and her old one is taken. NEED from Kelly: which room is she physically in now → then attach #11438 to that bed. (Root-cause: extension placement created without a bed lets the vacated bed look free and get re-let — worth a guard: AY/continuation accommodation rows shouldn't be left bed-null.)
  - [ ] **€800 not recorded.** She sent proof of a direct BOI transfer ("Rent room", €800 = 4 wks @ €200, authorised 05-10-2026, settled 06-10). Direct-to-bank (not PayNow/TransferMate) so no webhook fired → not in SIS, booking still €0/PENDING. Reconcile: confirm accounts/Saraa haven't already keyed it in HubSpot, then record €800 against booking 18357 (leaves €2,600 open). Awaiting Neil's go-ahead (financial write).

---

## Take the KickStart challenger nudge live

**Priority:** Medium
**Status:** Waiting — Neil (approve templates)
**Added:** 2026-10-09

The Mon/Wed/Fri reminder drip for KickStart challengers who haven't finished their tasks is built and the cron is running, but `data/challenger-nudge.json` is still `armed:false`. Dry run verified (cohort 32, eligible 31). (from Claude memory: project_challenge_nudge.md)
  - [ ] Neil approves/edits the 3 template bodies (slugs challenger-nudge-1/2/3)
  - [ ] Confirm the suppression list (currently 14575, 904)
  - [ ] Flip `armed:true`
  - [ ] Later: clawback escalation (take the discount back via card-on-file). Not built. Only 16 of ~106 challengers have a card on file.

---

## Build the academic seat-availability check (hard cap)

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-10-05

The Capel St accommodation check is built. The academic side is still spec only. Hard cap = 7 teaching rooms × 16 = 112 seats per session (AM+PM = 224/day). `Classroom.capacity` is null everywhere and Room 3 has no classes. (from Claude memory: project_soft_availability.md)
  - [x] 2026-10-14 FIX — accommodation checker now counts the availability UNIT per ROOM (not per bed) for regular types: a Premium room is a DOUBLE modelled as 2 beds, but one individual takes the whole room = ONE free unit (was reporting "4 beds free" against only 3 rooms). Only genuine stranger-shared rooms (Twin/Shared) still count per free bed. Output now NAMES the free rooms with type in brackets ("A1 / Room 2 (Premium, en-suite)"). `accommodationAvailability` in `src/scripts/accommodation.ts`; admin matching "Avail" overlay updated; alternatives gained `free`+`unit` fields (`freeBeds` kept as alias). tsc 0, restarted, verified live on the 2026-10-18→2027-01-09 window.
  - [ ] Hub b2b-sales agent (hub.ulearnschool.com/hubapp/b2b-sales#agent) wording: it composes "Premium — N beds free" from the endpoint. The NUMBER is now correct (counts rooms), but it still says "beds" for regular rooms. Point its prompt/tool at the endpoint's `summary` (fully room-worded + names rooms) or the new `rooms`/`unit` fields so it says "room". Hub-side change — can't edit from the SIS box.
  - [ ] Set capacities (16 per room, or keep hard-coded) and exclude/deactivate Room 3
  - [ ] Course seat function + endpoint + test page
  - [ ] Combined `/availability`, agent token auth, reservation mode (pending demand nets a bed)
  - [ ] Open decisions (Neil): hard-coded 16 vs per-room capacity; level heatmap; reservation vs occupancy mode default; private-course room subtraction; agent API key mint/rotate
  - [ ] Confirm the true AM ceiling (112 is provisional; no `centres` table yet) (from Claude memory: project_occupancy_seat_clearance.md)

---

## Finish the partner-contract cutover from Zoho Sign

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-07-17

The internal ETO Agreement signing replaced Zoho Sign, but the Zoho sync cron is still in the crontab (`dist/scripts/sync-contracts.js`, daily 06:45). (from Claude memory: project_partner_contract_signing.md)
  - [ ] Confirm the backfill ran and the gate blocks unsigned agencies in the UI
  - [ ] Disable the Zoho `sync-contracts` cron (keep the code ~3 months as a safety net)
  - [ ] Cancel the Zoho Sign subscription

---

## Live-test the Accelerator 22% default through autoQuote

**Priority:** Low
**Status:** Backlog
**Added:** 2026-09-03

Partners who sign without a fixed rate are auto-enrolled on the Accelerator ladder. Not yet tested end to end with a real confirmed-partner AY deal emitting 22% through autoQuote. Use a controlled "ABC Test" throwaway. (from Claude memory: project_accelerator_signing.md)

---

## Add a "Personal Assessment Section" (PAS) to the Friday assessment

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-05-18

Most of the Friday assessment is class-wide (everyone had the same week, so it follows the can-do statements and Pearson GSE vocabulary). Add a short personal section at the end, about 3 questions, tailored to errors the individual student showed in class (as recorded by the teacher) or in their homework. Questions could be written by the teacher or by AI. Assessment generation lives on the LMS side; see the Friday Assessment inputs design (Mon–Thu recap + programme_curriculum + class_output).

---

## Refactor: break up public/admin.html into smaller files

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-04-07

The single-file admin was 7,731 lines when this was written and is now ~21,000. Harder to navigate and edit, prone to merge conflicts, and the whole bundle loads on every request. Splitting reduces friction without a build step.
  - [ ] Phase 1, CSS extract: move the `<style>` block to `public/admin.css`, linked via `/sis/admin.css`. Zero behaviour risk.
  - [ ] Phase 2, JS extract (single file first): move the `<script>` block to `public/admin.js`. Inline `onclick` handlers keep working because functions stay global under classic scripts.
  - [ ] Phase 3, per-view split: `admin-core.js` (api, esc, formatDate, toast, navigate, openTab, sidebar), then `admin-students.js`, `admin-bookings.js`, `admin-classes.js`, `admin-teachers.js`, `admin-accommodation.js`, `admin-payroll.js`, `admin-documents.js`. Core loads first. Keep classic scripts.

Out of scope: ES modules, bundlers, and moving to `addEventListener`. Risk is medium in phase 3 (shared globals), so start with low-traffic views like Documents. Never use sed on admin.html.

---

## Centralise the WYSIWYG editors

**Priority:** Low
**Status:** Backlog
**Added:** 2026-06-04

`admin.html` has 5 duplicated rich-text editors (divergence and maintenance risk; the doc editor already differs). Font/colour controls are already centralised (`rtControls()`). Finish the job with a single `richEditor(id, opts)` helper that emits toolbar + contenteditable. CRITICAL: keep each editor's existing id or sends break. Low risk, own focused task.
Spec: `.claude/docs/MigrationCleanup/editor-centralisation.md`

---

## Student-app translation, phase 2 (app chrome)

**Priority:** Low
**Status:** Backlog
**Added:** 2026-06-29

Phase 1 is done and live: the KickStart €500 challenge + leaderboard are translated into PT/ES/IT/FR/DE/TR/JA/KO/ZH/RU+EN via `public/challenge-i18n.js`, auto-resolved from `Student.language` → nationality, with a flag toggle. Phase 2 = translate the app chrome only (tab/nav names, section/card headers, key buttons, ~40–60 strings) and move the toggle to a global spot. Skip long-form and staff-written content (that needs live machine translation).
Spec: `.claude/docs/mobile-app/translate.md`

---

## Add the English/Native toggle to the remaining email composers

**Priority:** Low
**Status:** Backlog
**Added:** 2026-06-30

Template translations (OpenAI → 10 languages) work in the profile composer (`sendCommsEmail`) and the bulk modal. The other per-context composers, pvComms `sendPvEmail` and the generic `commsBlock`/`sendCommsGeneric`, don't have the toggle yet. (from Claude memory: project_template_translations.md)

---

## Add a weekly payroll cron (Sunday pull)

**Priority:** Low
**Status:** Backlog
**Added:** 2026-04-07

Add a Sunday cron that pulls the weekly payroll data, once payroll is fully tested and operational. There is currently no payroll line in the crontab; the engine is `src/scripts/payroll.ts` (`refreshPayroll`). Context: teachers are paid hourly, on Thursday, with payroll cutting off the Wednesday before; the next month must include the Thu/Fri after the cutoff (Fidelo couldn't do this).

---

## Build the staff UI for the partner booking-form parser

**Priority:** Low
**Status:** Backlog
**Added:** 2026-06-06

Track B engine is built (`src/scripts/booking-parser.ts` `parseBookingPdf`: pdftotext + gpt-4o-mini). The remaining work is a thin staff UI: upload + pick agency → review (highlight `needsReview`) → existing `enroll()`. Never put the uploader in the partner portal. Track A (magic-link student form per agency) is spec only. Spec: `.claude/docs/parser/booking-intake-spec.md`. (from Claude memory: project_booking_intake.md)

---

## Arm the pre-arrival host reminder

**Priority:** Low
**Status:** Waiting — Neil (go-ahead to arm)
**Added:** 2026-10-10

`cron-arrival-reminder` runs daily at 09:30 but `data/arrival-reminder.json` is `armed:false`, so it sends nothing. Flip `armed:true` once to enable for all upcoming host-family arrivals (2 days' notice, one reminder per stay). (from Claude memory: project_host_arrival_reminder.md)

---

## Add WhatsApp / SMS channels to host outreach

**Priority:** Low
**Status:** Backlog
**Added:** 2026-07-02

The email nudge and AutoNudge Cascade are live and controlled from the admin UI. V2 adds WhatsApp/SMS. Not urgent; expected to lift response rates.
  - [ ] SMS is easiest (likely via the bird.com setup) but costs per message, so use only if the uplift justifies it
  - [ ] WhatsApp and SMS are mutually exclusive per host. Prefer WhatsApp where available (effectively free), else SMS.
  - [ ] Blocker: there is no accomm@ WhatsApp Cloud API, only the WhatsApp for Business handset app. The Cloud API (or a bird.com WhatsApp channel) is a prerequisite.
  - [ ] Open question: delay between email and the second channel (e.g. only text non-responders N hours later) vs all at once. Decide the "did they engage?" signal that suppresses the follow-up.
  - [ ] Design the sender as a channel switcher (per-host preferred channel + global on/off per channel)

---

## Host-portal communications preferences (self-serve)

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-07-02

Neil brain-dump, capture only. Let hosts control their own comms preferences so staff stop tracking holidays.
  - [ ] Profile avatar (initials) top-right of the portal → dropdown → Preferences → Communications. No login (stays click-to-view).
  - [ ] Default everything ON. Switches: Email · WhatsApp · SMS (or one "Text" toggle — decide at build).
  - [ ] Snooze for holidays as a first-class button: flips comms off and shows Snooze from/until; the end date turns comms back on automatically. Separate "Permanent off".
  - [ ] This replaces the deleted staff-set `activeFrom`/`activeTo`; a host claiming a student is itself an "I'm available" signal.
  - [ ] Rollout: start with just Email, then add WhatsApp/SMS + snooze as those channels come online.

---

## Build Travel Pair linking for host placement

**Priority:** Low
**Status:** Backlog
**Added:** 2026-07-02

Host portal slice 2. A Travel Pair = 2 (occasionally 3) students travelling together (same flight → usually same transfer and house). Distinct from a group. UI label "Travel Pair"; DB `travelPairId` UUID. Claims are single-placement only today. (from Claude memory: project_host_portal_v1.md)

---

## Transport V2–V4 (group buses, activity transport, Leap cards)

**Priority:** Low
**Status:** Backlog
**Added:** 2026-05-11

V1 (airport pickup/dropoff queue with Lynk confirmation) is live. Remaining phases:
  - [ ] V2, group bus bookings: show group bus jobs in Transport regardless of the 4-week cutoff (long lead time). Types: airport↔accom, activity shuttles, excursion shuttles.
  - [ ] V3, activity/excursion transport: city centre or accom → activity (Dublin) or excursion (outside Dublin); staff need to know who's on which bus. May overlap with the Activities module.
  - [ ] V4, Leap Card procurement: bulk buy for groups (~€32/week × N). A procurement task, not scheduling: get the group list → check spare office cards → recharge or buy. Placeholder names ("Child 1"…) with age + gender when no manifest.

Out of scope: Link Taxis API, in-app payment, dropoff billing reconciliation. Connects to the mobile-app spec (`lms/.claude/1.plan/mobile-app/spec.md`), the student-facing Transport card.

---

## Group Management follow-ups

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-06

The Group module pipeline is complete (upload/pull/paste → AI parse → review → create students/bookings at €0 → push HubSpot contacts). Remaining items: (from Claude memory: project_group_management.md)
  - [ ] Neil to OK the general placement-engine change: `recordResult` overwrites the first booking only
  - [ ] Phase 3: bulk short-stay LoA (standard LoA minus insurance)
  - [ ] Send dialog still labels the recipient "Student" for groups (cosmetic)
  - [ ] No generic UI yet to link a portal contact to a group

---

## LoA follow-ups (passport step in app, auto-refresh on field edit)

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-12

  - [ ] Deferred ("app stuff second"): front-end passport to-do / onboarding step / green alert after the welcome video. Only the passport-request email was built. (from Claude memory: project_loa_auto_issue.md)
  - [ ] Parked: auto-refresh-from-source when a Student/Booking field is edited (check for docs containing that field, then run `refreshDocumentFromSource`). Deliberately parked 2026-07-05. (from Claude memory: project_living_loa_documents.md)

---

## Cascade course reschedules to booking service window and HubSpot deal dates

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-09-11

When a course is rescheduled, the booking service window and HubSpot deal dates go stale (a systemic accom/date cascade). Offered, Neil's call. The transfer chase cron and Date-TBC panel are the safety net until then. (from Claude memory: project_transport_arrival_gap.md)

---

## Support true double reservations on one deal

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-08-13

<2–5% of bookings have 2 different courses or 2 different accommodations at different times (e.g. apartment then host family). Root problem: line items carry no dates; course/accom dates come only from the deal's single flat fields. Invoice/SIS/Xero already handle n courses + accom from line items; only the deal fields can't. Parked. (from Claude memory: project_resync_authoritative.md)

---

## Partner-portal LifePass earnings display

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-06-07

Spec'd, not built (pre-revenue). Hero "€X/month recurring" (€66.75 × active LifePass students) + staircase chart; accrual source = the `-Sub` master invoice's `hs_amount_paid`, not `instalment.paidAt`. (from Claude memory: project_lifepass_earnings.md)
  - [ ] Opt-in Load/Remove Sample Data (demo source, not an `isSample` flag)
  - [ ] Wire real accrual off the `-Sub` invoice and fix the `liveFinance` `-Sub` leak
  - [ ] v2: "at your current pace" projection

---

## Partner credit: auto-apply at enrolment (phase 3)

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-07-18

The partner credit ledger and its 3-way Xero/HubSpot push are built. Parked: on booking-form submit, look up the agency's credit balance and surface it into HubSpot (task/flag) at deal/autoQuote time. HubSpot's `credit_memos` API is 403 for standard apps. (from Claude memory: project_partner_credit_ledger.md)

---

## Student self-booking v2: in-app payment and draft quote

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-04-18

V1 ("+ Book" → continuation deal + autoQuote + staff task) is built. Only explore v2 once v1 is stable:
  - [ ] Direct payment: course always allowed (seats + level known); accommodation needs ≥72h notice (warn if arrival <72h, per T&C); extras anytime. Payment rail (Stripe/TransferMate) TBD.
  - [ ] Client-side draft quote from the pricing JSON catalogue, rendered in the app/portal before touching HubSpot; the student adjusts and sends, then it goes through the manual gate
  - Partner portal note: partner extension bookings are rare (~5%), so the full B2B quote/invoice process stays right for partners.

---

## Agency dedup leftovers

**Priority:** Low
**Status:** Backlog
**Added:** 2026-06-06

  - [ ] Manually confirm the 3 weak Phase-2 matches: maltamalta.com, MatchMYCourse → Match My Course, WEST1 → WEST 1 (from Claude memory: project_agency_dedup_grandfather.md)
  - [ ] Void Micael Goulart's HubSpot "Partner Onboard" deal 515037176009 (bot-registered partner, SIS rows deleted). Contact 835976200403 / company 376032476352 still carry a stale `sis_portal` stamp. (from Claude memory: project_partner_registration_gate.md)

---

## Cleaning queue: finish issue #54 addendum

**Priority:** Low
**Status:** Backlog
**Added:** 2026-08-26

Run recipe `issue-54-addendum` (reconcile BA11161 to match the already-cleaned twin BA11160) and write the #54 status to the Cleanup sheet via `node .claude/cron/sheet.js`. Check first; it may already be done. (from Claude memory: project_cleaning_queue_per_room.md)

---

## iOS app: confirm App Store review outcome

**Priority:** Low
**Status:** Waiting — Apple (App Store review; verify outcome)
**Added:** 2026-09-21

v1.0 was submitted to App Store review 2026-09-21. Keep demo student 14561 (`app-review@`) alive until approved. Optional: add `ITSAppUsesNonExemptEncryption = NO` to `ios/App/App/Info.plist` in `/home/sis/dev/sis-mobile` to skip the export-compliance prompt on future builds (needs a rebuild). (from Claude memory: project_ios_testflight.md)

---

## Payment identification: better references on student transfers

**Priority:** Low
**Status:** Backlog
**Added:** 2026-04-07

It is still hard to match incoming payments to specific students/bookings; references are often a legacy Fidelo ID. Put better reference codes on invoices (booking ID, student ID in the transfer reference). The SIS student id is already mirrored to HubSpot `student_id` so the TM checkout prefills it.

---

## Invoice line-item descriptions with date range

**Priority:** Low
**Status:** Backlog
**Added:** 2026-04-07

Auto-populate the HubSpot line item `description` with the date range from deal properties, e.g. "Morning slot, 25 March – 14 April" (deal start_date + weeks → end date). Helps invoice clarity, visa letter references and compliance. autoQuote (hub `scripts/quote-inv/autoQuote.js`) currently sets only "Summer"/diet subtitles, not dates. Staff need to know dates now come from HubSpot, not Fidelo.

---

## HubSpot → Xero line-item order

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-04-07

The native HubSpot→Xero data sync doesn't preserve line-item order. Cosmetic only (totals/accounting unaffected). If order matters on client-facing invoices, reorder manually or build a custom sync that respects order. Monitor.

---

## Bring old Xero hosts into SIS with an activity status

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-04-07

Xero likely has many more (older) hosts than SIS. Not sure it's worth importing them. If imported, they need an active/quiet/inactive status based on last booking, and quiet/inactive hosts kept off the Matching screen. Host categories (SuperHost/BusyBee/Regular/Interested/Sleeper/Dormant) now auto-derive from hosting history and could carry this.

---

## Fidelo legacy attendance: full 52-week historical backfill

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-09-21

Pre-04/05/2026 Fidelo attendance % is backfilled for current students. The full 52-week historical job (final % for departed students) is deferred. Method in `fidelo-history/backfill-instructions.md`; match key = sheet "Student ID" == `fidelo_customer_num`. (from Claude memory: project_fidelo_legacy_attendance.md)

---

## ARACHAS insurance purchase: reduce manual entry

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-05-22

Antonella buys Learner Protection + Medical one by one on ARACHAS. Check whether ARACHAS has an API; otherwise (a) a bookmarklet/extension that autofills their web form from the open SIS student page, or (b) a "record purchase" form (policy number + PDF upload). Policy PDFs are already auto-classified on upload. (from Claude memory: project_insurance_workflow.md)

---

## Partner user-account invitations (bulk)

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-04-18

Original plan: for all active partners, create user + password + email, add temporarily to HubSpot, then send an email with personalisation tokens for the login. Probably superseded: partners now self-register at `/sis/partners/register` (allow-list gate) and established partners were grandfathered. Confirm, then close.

---

## B2B quote template "Commission" label in HubSpot (#10)

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-04-18

Cosmetic, HubSpot side: B2B quote template with a "Commission" label. Probably stale: quotes/invoices are now always NET, and the partner agreement reframed commission as "Wholesale Discount". Confirm, then close.

---

---

## Fix the Monday host-payments cron (no cd → module not found)

**Priority:** High
**Status:** Waiting — Neil (first run after the fix may catch up on missed weeks)
**Added:** 2026-10-14

sis crontab line `0 3 * * 1 node dist/scripts/cron-host-payments.js >> …/private/db/host-payments.log` has no `cd …/public_html/sis &&`, so it fails every Monday with `Cannot find module '/home/sis/dist/scripts/cron-host-payments.js'` (28 failures in the log). The other host-payment crons have the `cd`. Check what the job does on a first run after weeks off before fixing.

---

## Attendance roster hides paid/escrow/net-terms students (ILEP gap)

**Priority:** High
**Status:** Waiting — Neil (approve full weekly report + the gate fix)
**Added:** 2026-10-14

Students physically in class but absent from the SIS output list, so attendance can't be recorded (Slack, Antonella/Paul). Root cause: the class **placement pool** (`classes.ts` `unassignedStudents`, feeds `attendance.ts` roster) only surfaces a booking course that has **≥1 real non-escrow Payment row** (plus active course / not ESCROW-CANCELLED / visa not Pending). **Agency net-terms** students (agency settles net → no per-student Payment rows) and **escrow/visa-pending** students have no qualifying row → hidden from placement → can't be rostered even when paid-up and attending → **ILEP attendance-recording gap**.
Named cases diagnosed: Ana Jessica #766 (fixed, assign now) · Nominjin #759 (paid, 0 Payment rows, net-terms) · Uyanga #917 (escrow €3066 only) · Jiaming #14487 (visa Approved but escrow €2800 unreleased + course active=false + PM→AM) · Telmuun #293 (partial, €250 owed, non-admin lock) · Ariunsarnai #1047 (genuinely unpaid, PENDING — the one true commercial case). Group B "conversation class" = mostly on their main roster; the conversation class isn't a SIS class (Rakan #14444 genuinely unassigned).
  - [ ] Generate authoritative weekly report: every student with an active course covering the week on NO roster, reason-coded (net-terms / escrow / no-payment-rows / unpaid / visa-pending / inactive-course)
  - [ ] Decide the gate fix: surface escrow/net-terms/paid students into the pool for ATTENDANCE (flagged), keep truly-unpaid visibly flagged
  - [ ] Chase Jiaming #14487 stuck escrow (visa Approved, not released) on hub/finance side
  - [ ] **Ariunsarnai Batbayar #1047 — roster-and-flag-unpaid bucket (further review).** Fidelo API check (2026-10-14) confirms Fidelo invoice D2026201 (€1509) was NEVER paid: zero Incoming-Payment records for her customer number 30921, her name, or the invoice number (only "Batbayar" hit is an unrelated 2019 student, cust 20814). No agency "Internal Assignment"/credit entry either (that's how Saraa-settled students show, e.g. Batzorig cust 29433 "Paid by Agent Saraa"). So NOT a sync/timing artifact and NOT a credit — genuinely €1509 outstanding (SIS PENDING €0 + HubSpot deal 502951083215 open all agree). She's physically back in class this week (approved leave), so she needs rostering under the gate fix (attending-but-unpaid, flagged); the €1509 is a Saraa chase.

---

## Host-portal duplicate Bills (orphan Xero drafts) — issue #63

**Priority:** High
**Status:** Waiting — Neil (approve deletes + pick systemic fix)
**Added:** 2026-10-14

Hosts see two Bills for one stay (Slack, Kelly/accomm@). H-number = `3500 + host_payment_line_item.id`. Each dupe is an orphan draft left when a payment run's Xero push **partially failed** (`xeroBillId=null`); the next run correctly re-billed (new bill submitted to Xero) but the "clear un-pushed drafts" cleanup (`host-payments.ts:98-118`) is keyed to the **same runDate only**, so the orphan persists, and the portal query (`host-portal.ts:314`) lists line items with no `xeroBillId`/status filter → host sees both. **Xero token is HEALTHY** (not a dead-key issue — auto-refreshing `xero-tokens.json`).
  - [ ] Delete orphan SIS line items (xeroBillId null, never in Xero, never paid): **218** (H-3718, Bob&Ann O'Sullivan — keep H-3725/id225), **222** (H-3722, Edel McDonald — keep H-3727/id227), **65** (H-3565, Patty McSweeney — pre-existing dupe). No Xero write needed.
  - [ ] Systemic: (a) portal filter out `xeroBillId:null` drafts from host-facing list, and/or (b) broaden cross-run orphan cleanup, and/or (c) surface failed Xero pushes for retry instead of silently orphaning.
  - [x] Deleted orphan line items 65/218/222 on 2026-10-14 — all xeroBillId null, confirmed never in Xero; Kelly pays H-3725 + H-3727.

---

## Email template hierarchy reorg (Student Operations)

**Priority:** Medium
**Status:** Waiting — Neil (pick Option A/B + confirm 7 ambiguous, then execute)
**Added:** 2026-10-14

Reorg per `.claude/tmp/doc-hierarchy.md`: introduce Student Operations with Student Administration / Student Success, reclassify ~44 templates by function. Audit complete (full before/after mapping produced, nothing executed). Category-string changes only — slugs/ids/tokens/TEMPLATE_ID_BY_SLUG untouched, so send/automation paths unaffected.
  - [ ] Decision: Option A (2-level nav, parents "Student Admin"/"Student Success", no code change — recommended) vs Option B (~15-line buildTree change for a true 3-level Operations umbrella). Nav buildTree is 2-level today, no "Other" catch-all.
  - [ ] Confirm 7 ambiguous: DOSVisitRequest-Student(11), LEAP(69), Trial(72)/Trial-FollowUp(71), End-Certificate(68), Confirm-Group(58), LifePass-Agreement(112), FeedbackFinal2-ExitLetter(60).
  - [ ] "Attendance & Holiday Self-Service" (#99) to Student Success (Neil override; student-facing self-service).
  - [ ] Execute: ~44 category updates + new EMAIL_TREE/DOC_TREE nodes + remove emptied nodes; fold the 3 still-orphaned accomm/transport categories in too.


## Legacy TransferMate-escrow escape hole — sweep siblings of Jiaming Wang

**Priority:** Low
**Status:** Waiting — TransferMate (report on the card escape hole; no SIS-side search needed)
**Added:** 2026-10-14

Not a duplicate student (one clean SIS record #14487). Root issue Neil diagnosed: he paid via TransferMate by credit/debit card, which TransferMate should have blocked for a visa-required (escrow) student but did NOT — the card funds were paid straight out to us in 2025, bypassing the escrow filter entirely. The money landed against the old Fidelo invoice D2025348 (€2800, 2025-07-14) and was banked as general revenue in Xero (no Xero invoice existed then). When the deal later closed-won on 2026-08-07 (visa approval), the new system raised INV-1460 (€2800) — the upstream invoice-creation is what creates the SIS booking downstream, so it was likely raised to populate SIS. **TransferMate escape hole since resolved by Neil (shouldn't recur).**
**Resolution (Neil, manual, 2026-10-14):** found the 2025 €2800 payment in Xero, un-reconciled it from general revenue and re-reconciled it against INV-1460 (now paid, not a duplicate); then reset the HubSpot deal to contractsent + escrow="Yes" to simulate a proper TransferMate→escrow-aligned payout and watch it flow downstream.
  - [x] Confirmed downstream (2026-10-14): HubSpot escrow Yes→No + deal WON fired correctly. SIS `/invoice-paid` created a NEW Standard payment #18245 (€2800, HubSpot src) and booking #17886 → CONFIRMED / paid €2800 (not doubled — escrow rows excluded from amountPaid). The manual deal edit alone did NOT flip SIS (no TM escrow webhook); the invoice-paid sync is what landed it.
  - [x] Sibling sweep NOT needed from our side — Neil emailed TransferMate 2026-10-14 for their report on who card-paid through the escape hole (easier than searching SIS). Reconcile any they return against the new invoice (don't void).
  - [ ] Minor: Xero contact email zachary0505@163.com differs from SIS wjm2860@gmail.com (possible stray contact).

---

## SIS escrow-RELEASE payment-row conversion — refund mirror + Jiaming one-off

**Priority:** Medium
**Status:** Waiting — Neil (finish the refund-mechanics sentence + authorize the Jiaming DB one-off)
**Added:** 2026-10-14

Release side BUILT + approach approved by Neil 2026-10-14: on escrow release the EXISTING escrow shadow row is converted in place (not a duplicate added). Verified in fins: the escrow MACHINERY is extensive (`fins/scripts/tm` — handleEscrow/moveDealToWon/Lost, handleRefusal+€300 retention, webhook.js card-hold lane, hs-invoice-hook URL stamp) but `handleEscrowRelease` only flips HubSpot and has ZERO callers; it punts the SIS side ("moves off ESCROW via its own release handling"), which never did the conversion. Audit trail in central KB `kb/finance/escrow.md` + memory project_escrow_flag_release.
  - [x] Release conversion built in SIS `/invoice-paid` commerce-payment sync (`webhooks.ts` ~2708): if a row already carries the HubSpot payment id → volatile re-sync; else if EXACTLY ONE unlinked escrow shadow (type='Escrow' OR method='TransferMate Escrow') matches the amount (±€0.01) → convert it to `type='Standard'`, stamp the HubSpot payment id, KEEP method; else create a new row as before. tsc 0, restarted 2026-10-14.
  - [x] Display fix (admin.html): payment Add + Edit overlays — Method and Type stacked full-width (Type below Method), was a skewed 2-col grid.
  - [ ] REFUND mirror (Neil 2026-10-14: will get to it later): on visa refusal (escrow→No + deal LOST) the same shadow row should be updated "in the negative" to reflect money returned to the student minus our fees (retention €300 = €250 visa + €50 reg, +€65 accomm if booked). Decide: `type='Refund'` vs negative amount, and how retention is represented. NOTE the SIS refusal endpoint is still unbuilt — fins `postRefusalToSis`/`TM_SIS_REFUSAL_URL` is "pending", so the refund SIS lane needs building too.
  - [x] One-off Jiaming #14487 / booking #17886 DONE (Neil ran it 2026-10-14): escrow shadow #17210 → type Standard, method kept (TransferMate Escrow), stamped HubSpot payment id 1400251590876; duplicate #18245 deleted. One released €2800 row, paid €2800, CONFIRMED.
  - Full workflow + adoption edge cases (partial escrow, equal-amount shadows) now documented in the SIS technical manual `.claude/docs/manual/Finance/Escrow.md` + central KB `kb/finance/escrow.md` — not a ToDo.

---

## Reconcile the TransferMate in-escrow list against attendance (release what's owed)

**Priority:** High
**Status:** Waiting — TransferMate (Neil requested the definitive in-escrow list; expected ~2026-10-14)
**Added:** 2026-10-14

Neil has asked TransferMate for the authoritative "who is in escrow right now" list (TM reporting is CSV-only and clunky). When it lands, cross-reference each name against SIS attendance using the heuristic (documented in KB `kb/finance/escrow.md` + manual `Finance/Escrow.md`):
  - [ ] Attending our school (roster OR named on the paper attendance sheet) ⇒ in the State ⇒ visa approved ⇒ the held money should already have released → flag to chase TM for release; once released, apply the release-conversion (flip the escrow shadow → Standard).
  - [ ] Not yet arrived but visa approved ⇒ legitimately still held; the success-notice to TM just wasn't sent → trigger it.
  - [ ] Neither ⇒ genuinely pending visa decision → leave held.
  - [ ] Uyanga Tungalag (#917, booking #1467, Easy Go): TM email confirms €3,066 held since 20/10/2025 (ref ULEARNP2025900), no release notice ever issued; she is in Ireland renewing (first visa approved) → €3,066 owed to us, should release. SIS escrow tag is CORRECT — do NOT re-tag; release only on TM confirmation. Classic "Saraa special" (partner notified, did nothing, sent LOA prematurely).
  - Root cause is the un-triggered release step, not a code bug; the new system blocks ad-hoc LOA sends so it shouldn't recur.

---

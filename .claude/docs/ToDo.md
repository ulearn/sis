# SIS — ToDo

Open work for this project. Protocol: anything left unfinished at the end of a session goes here (not in memory); finished work is moved to ToDo-Done.md. Synced with Wrike (space "hub" → folder "SIS") every 5 minutes — edit the text here; status syncs both ways.

## Exam booking → Procurement dashboard integration (cohort A/B)

**Priority:** High
**Status:** In progress — handover delivered to fins Claude; SIS-side decisions open
**Added:** 2026-10-26
**Updated:** 2026-10-26T12:40:06Z

Code-checked the built exam module 2026-10-26. It works (eligibility, picker, CES templates, admin, reminder cron; 252 CES sittings loaded; 3 test `StudentExamBooking` rows, all NEEDS_ATTENTION). Nothing live — `cesEmail=null` blocks sends, `directPayEnabled=false` = everyone treated PREPAID. Handover written for the fins Claude: `hub:~/web/hub.ulearnschool.com/public_html/fins/EXAM-PROCUREMENT-HANDOVER.md`.

New requirement (Neil, reoriented 2026-10-26): **SIS PUSHES** cohort-A (prepaid) exam bookings into the **fins procurement dashboard** (`/fins/procurement`) the moment the student books — requester "SIS". Accounts approve weekly → then CES is notified. NOT a hub poll. Cohort B (not prepaid) stays direct-to-CES, never procurement. Note at `hub:~/web/hub.ulearnschool.com/public_html/fins/EXAM-PROCUREMENT-HANDOVER.md`.

- **Detection = already seated:** `/invoice-paid` webhook writes the exam line from the paid HubSpot invoice onto the booking as an `EXAM_FEE` `BookingExtra`. Has paid exam extra ⇒ cohort A; none ⇒ cohort B.
- **Kill the v1/v2 framing in code** — replace the global `cfg.directPayEnabled` toggle with per-student cohort A/B on the exam extra (`src/scripts/exams.ts:287`, `src/lib/exam-config.ts`).
- **Surfacing rule:** fully paid → green; >50% paid → amber (chase balance); ≤50%/deposit → don't surface.
- [x] **Push built (2026-10-26):** `hub:fins/scripts/procurement/exams.js` — reconcile script (sibling of `extras.js`), reads SIS via `sisRead` for PREPAID `REQUEST_PENDING`/`REQUESTED` exam bookings, raises **one `store.create` request per booking** (`reference=EX-<id>`, deduped, `requester=SIS`, `category=exams`, `neededBy`=exam date, `amount`=feeEur). Payment tiers: fully paid→raised; >50%→raised+amber title; ≤50%→skipped. Run `node exams.js [--apply]` ("fake the cron"). Dry-run clean; 0 eligible until a student books (the 3 existing rows are NEEDS_ATTENTION assistance asks). No `dashboard.html` change needed (standard card UI → per-student approve/defer).
- [ ] **Still SIS-side:** move the cohort-A CES send to post-approval (currently just blocked by `cesEmail=null`); decide whether to cron `exams.js` (daily) vs on-booking trigger.
- [ ] **Move the cohort-A CES send to post-approval** — `createExamRequest` currently emails CES on click; cohort A must wait for procurement approval. Cohort B keeps the on-click direct send. (No cleanup — sends blocked today, `cesEmail=null`.)
- [ ] **Legacy detection caveat:** only 142/2,271 AY bookings carry the extra today (rest = Fidelio legacy, no webhook). A current legacy student could mis-read as cohort B. Keep conservative default (cohort A) until closed; measure against live in-school cohort before arming.
- **fins Claude owns:** a "SIS"/System requester in `config.json`; an HTTP intake endpoint calling `store.addAutoLines('exams', head, [line])`; amber/green display; on-approval → CES notify.
- Statutory "I will sit the exam" undertaking already captured in the student contract (`student-contract.ts`, v2026-10-v1).

---

## Sarantuya Taivankhuu Co. (#347) — credit ledger −€50 + legacy-credit gap

**Priority:** Medium
**Status:** Waiting — Neil (how to resolve the −€50; whether to backfill legacy grants)
**Added:** 2026-10-22
**Updated:** 2026-10-22T17:55:06Z

Agency 347 (Saraa / Sarantuya) partner portal shows **Credit on Account = −€50** — an impossible negative. Diagnosed 2026-10-22.

- The formal `agency_credits` ledger has only 5 rows (all 2026): +980 / −980 (Nominjin Amartsogt) net 0; +1400 (CREDIT #17 "Gunsanaa refunding", src Gantuguldur's payment → Xero CN-0413) / −1400 (DEBIT #18, auto, HubSpot credit memo on Gantuguldur Gansukh booking #18321) net 0; then **DEBIT #19 −€50** (auto, HubSpot credit memo on Ariuntugs Boldbaatar booking #18332, SIS payment #18210 method "ULearn Credit").
- **Root cause: #19 is an UNFUNDED auto-debit.** The invoice-paid webhook posts a DEBIT whenever it detects a HubSpot credit memo applied to a booking invoice, but no matching +€50 CREDIT grant was ever banked for this agency → balance goes negative. Not a code bug in itself; a data gap (the grant side was never formalised).
- **Systemic:** this agency has a **7-year history of informal cross-student "Internal Assignment" / "ULearn Credit" reallocations** (Saraa moves balances between students constantly — dozens of payments, e.g. #648/#649, #17087/#17088, #964/#966, #17460-17463). The formal ledger (starts 2026-06) captures almost none of it, so Neil's "credit audit" is blind to pre-2026 credit and to any memo applied without a SIS grant row.
- **Resolution options for the €50 (Neil's call):** (a) if the €50 HubSpot credit memo is legitimate (a real reallocation from some student balance), add a +€50 CREDIT grant row documenting its source → ledger zeroes; (b) if the memo was applied in error, void it in HubSpot + void DEBIT #19. Do NOT auto-create a grant on assumption (finance-sensitive). Also consider: clamp the portal display at ≥0 and flag negatives rather than showing −€50 to the agency.

---

## Uyanga Tungalag (#917) — €3,066 escrow receipt reconciliation + INV-1571 renewal balance

**Priority:** Medium
**Status:** Waiting — Neil/finance (code the €3,066 in Xero; watch INV-1571 €1,620)
**Added:** 2026-10-23
**Updated:** 2026-10-23

€3,066 "Received" bank line (ref `ULEARNP2025900`, 20 Oct 2026) was unreconcilable against Xero. Diagnosed 2026-10-23 — it's the **original Fidelio Academic Year booking's escrow**, finally cleared to the bank; nothing in Xero to match because that booking predates the migration.

- **Booking #1467** (Fidelio id 41545) — AY Morning, 27 Apr → 20 Nov 2026, Mongolian (visa→escrow). No HubSpot deal, **no Xero invoice** (pre-May-2026). Escrow €3,066 placed 20 Oct 2025 (receipt R20253818, Fidelio payment 36936), now released to bank.
- **€2,405 vs €3,370 is the known Fidelio gross/net artefact:** €3,370 = gross `course.fee`; €2,405 = net the school recorded as banked (`amount_total`), ~28.6% off — one of the 474 bookings in the `fidelo-gross-net-cleanup` task. EasyGo (#117) is net terms ("Net prior to arrival"; ~25% indicative — confirm rate from HubSpot, authoritative, not the Postgres holdover field).
- **We banked €3,066 — €661 over the recorded net €2,405.** Escrow holds the student-side payment; €2,405 was commission-netted. Per Neil: take the surplus to incomings, don't query EasyGo.
- **Xero action:** code the €3,066 to the old AY booking (course-fee income, or clear a 2025 AY receivable if accrued — not-yet-closed 2025 accounts). **Do NOT apply it to INV-1571.**
- **Renewal is separate:** deal 524422961339 → **INV-1571** (issued 13 Oct 2026, AUTHORISED): €1,870 total (Renewal AY AM €1,500 + Insurance €150 + Exam €220), **€250 paid, €1,620 due**. Watch that balance; unrelated to the €3,066.

---

## Saikhantes Shagdarsuren (#1001) — renewal LoA (RESOLVED) + €750 Nov balance watch

**Priority:** Medium
**Status:** Waiting — Nov payment (agent Saraa) · LoA issued 2026-10-22
**Added:** 2026-10-22
**Updated:** 2026-10-22T19:25:06Z

RESOLVED 2026-10-22: renewal LoA issued for the embassy appointment. Chain cleared: invoice **INV-1601** raised on deal **529492368616** (€1,500), SIS booking **#18398** ingested, **€750 paid** via credit assignment (below), LoA issued manually by NM.

- **€750 paid leg:** Gantogtokh Bayarjargal's visa-refusal refund (#1568) was assigned to Saikhantes's renewal. Saikhantes paid agent Saraa; Saraa paid Gantogtokh — the €750 **never transited ULearn's bank**. Recorded as HubSpot commerce payment 1412150526169 applied to INV-1601 (05 Oct) → auto-synced to SIS #18398 (PARTIAL, €750/€1,500, payment #18271). Offsetting leg on refund #81 (below). **Xero: reconcile this non-bank payment to a clearing/suspense account, NOT the bank** (finance/accounts@).
- **Remaining €750 (open balance, due November):** left as the student's open invoice balance; agent **Saraa / Sarantuya #347 is responsible / "standing over it"** — recorded as financial note #12 on #18398. NOT posted as an agency-ledger debit (would double-count the open invoice). If Nov payment misses, convert then.
- **Credit-history note:** her 2025 booking #1724 was part-funded by two €550 legacy Internal Assignment reallocations (#648/#649) from other students' balances — which is why she's absent from the formal agency credit audit (legacy moves, not ledger grants).

---

## Gantogtokh Bayarjargal (#1016) — visa-refusal refund #81 pending approval

**Priority:** Medium
**Status:** Waiting — Neil (approve/dispatch; stamp €250 AIB)
**Added:** 2026-10-22
**Updated:** 2026-10-22T19:25:07Z

RefundRequest **#81** created 2026-10-22 (visa refusal; never arrived — 0 attendance). Base €2,290 − €300 fee = **€1,990 due**.

- **Recorded:** €750 refunded via credit assignment to Saikhantes #18398 (non-bank, see above) → `amountRefunded €750`.
- **Not yet stamped:** €250 cash refunded via AIB (NM, 12 Oct) per REFUNDS sheet. Stamp it (`amountRefunded → €1,000`) to show the true **€990 cash balance**.
- **NOT approved/dispatched** — approval cancels booking #1568 + moves HubSpot deal → lost (escrow=No) + raises Xero RFV bill for the €990 cash balance. Awaiting Neil's go.

---

## Escrow state reconciliation — SIS↔HubSpot↔TransferMate drift

**Priority:** Medium
**Status:** Waiting — Neil/finance (confirm releases with TransferMate before converting)
**Added:** 2026-10-22
**Updated:** 2026-10-22T11:30:06Z

Fixed the operational bug (2026-10-22): the class-placement pool wrongly excluded released students whose Payment kept `method='TransferMate Escrow'` (permanent provenance per `.knowledge/kb/finance/escrow.md`). It now discriminates held on `type='Escrow'` only (classes.ts `unassignedStudents`). Jiaming Wang #14487 unblocked; KB updated with the alignment rule.

Audit surfaced SIS-held (`type='Escrow'`) rows out of step with HubSpot — each needs TransferMate confirmation before converting the shadow row to `type='Standard'` (KB rule: never re-tag on assumption; release only when TM confirms):
- [ ] **Closed-WON but HubSpot `escrow=Yes`** (Yes→No flip never fired; SIS shadow still held): Saranzaya Khishigbayar #931 (deal 343764313287), Burte-Ujin Ulziibat #1038 (503018836167), Ying Pan #14657 (517774452974).
- [ ] **HubSpot `escrow=No` + won (released) but SIS shadow still `type='Escrow'`**: Fayez Alanazi #14605 (509475255488) — clearest "released in HS, not converted in SIS".
- [ ] **Visa APPROVED but still held both sides** → chase TM to release: Hangtian Zhang #14646 (517613161707); plus Uyanga Tungalag #917 (already in KB, awaiting TM).
- [ ] **HubSpot `escrow=null` (never-escrow) but SIS tagged escrow + deal won**: Wanying Song #872 (297666180293) — likely a mis-tag; review.

---

## Gate LOA auto-issue email on the signed contract (LifePass/AY)

**Priority:** Medium
**Status:** Waiting — Neil (pick option A/B + placement-gate call)
**Added:** 2026-10-15
**Updated:** 2026-10-15T17:30:06Z

Diego (partners@, Slack 2026-10-15) flagged Roger Luis Dorfschmidt #14700: LOA shouldn't be out — LifePass T&Cs unsigned + placement test not done. Investigated — **no leak**: 0 DocumentRecords (no LOA ever issued for him), and he HAS signed the in-app Student Agreement (`contract_signed_at = 2026-10-09`, version 2026-09-v1, which folds in the LifePass Programme Terms appendix). Placement test genuinely not done (`placement_test_date` null) — Diego has emailed him. Diego's "send back a signed copy" reflects the old emailed-PDF process; the new in-app hard gate (`STUDENT_CONTRACT_GATE=on`) already covers it.

Structural gap to decide on (Neil said "can't access the LOA until he signs it — not a big deal"; that holds for the in-app download but not the email):
  - [ ] `autoIssueLoaForBooking` (`src/scripts/documents.ts`) gates only on AY + fully-funded + passport — it does NOT check `contract_signed_at`, and on issue it EMAILS the LOA PDF to the student via `notifyDocument(student:true)`, which bypasses the app's contract gate. So a funded+passport LifePass student who hasn't signed could receive the LOA by email. **Option A (recommended):** still generate+record the LOA, but suppress the student email copy until signed (agent copy ok) — student retrieves it in-app after signing, exactly matching the intended "no LOA until signed," with no LOA delay for the many students who pay+passport before signing. **Option B (Diego's literal ask):** don't issue at all until signed (simpler, but delays the record + agent copy for ALL AY students, not just LifePass).
  - [ ] Placement test as an LOA gate? Diego wants it; Neil didn't mention it. Recommend NOT gating LOA on placement (placement sets class level, not acceptance/visa). Confirm.

---

## Re-sign existing non-EU AY students on the exam-inclusive Student Agreement

**Priority:** Medium
**Status:** Waiting — Neil (re-sign vs rely on exam-module consent)
**Added:** 2026-10-15
**Updated:** 2026-10-15T15:15:06Z

Done today (2026-10-15, no action needed): folded the end-of-programme exam obligation into the signed Student Agreement for TrustEd/ILEP compliance as we move to examless up-front charging. New **§12 "End-of-Programme Examination"** + a signed Student Declaration line, conditional on non-EEA / 25-week / Stamp 2; states ULearn arranges registration in line with ILEP / Department of Justice / TrustEd and that the exam fee is not included in tuition unless the booking confirmation says so. Bumped `CONTRACT_VERSION` → `2026-10-v1` (`src/scripts/student-contract.ts`); KB `kb/courses/academic-year/Exam-Renewal-Protocol.md` updated with the implementation note. tsc 0, restarted, render-verified.

Leftover — the backfill decision:
  - [ ] All **247** currently-signed agreements predate the clause (141 on `2026-07-v1`, 85 `grandfathered-2026-07`, 21 `2026-09-v1`; 0 on `2026-10-v1` yet). Go-forward signers are covered automatically. **Decide for the existing non-EU AY cohort:** re-issue the agreement for re-sign (cleanest audit trail), or treat the per-booking exam-module consent as sufficient for those who already signed. If re-sign: scope = active/upcoming non-EEA 25-week Stamp 2 students only (not B2C/EU/juniors/past students).

---

## Rotate credentials exposed in SIS git history

**Priority:** High
**Status:** Backlog
**Added:** 2026-10-10
**Updated:** 2026-10-13T21:52:25Z

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
**Updated:** 2026-10-13T21:52:24Z

474 Fidelo bookings with ~€388k drift between the gross course rack-rate (`booking_course.fee`) and the net amount banked (`booking.amount_total`). Two algorithm candidates documented; decision pending. **2025 year-end accounts depend on this.**
Spec: `.claude/docs/ToDo/fidelo-gross-net-cleanup.md`

---

## Finish the post-Fidelo migration cleanup (duplicates + course naming)

**Priority:** Medium
**Status:** Waiting — Neil (true figures for the payment-differs pairs; course-name dictionary)
**Added:** 2026-06-03
**Updated:** 2026-10-13T21:52:26Z

Post-Fidelo backfill cleanup. Specs in `.claude/docs/MigrationCleanup/`.
  - [ ] **Duplicates** (`MigrationCleanup/dupes.md`): booking/payment reconnect — 83 done, 11 left, all "payment differs", waiting on Neil's true-figure call. Also unassigned-pool escrow/shadow flips and literal duplicate students. Forward-facing urgent cohort list: `.claude/docs/dup-bookings-urgent.md`.
  - [ ] **Course naming** (`MigrationCleanup/course-canon.md`): Fidelo course names → canonical "General English…". Recipe and mapping locked, parked ready to run (in lockstep: ILEP deriver Sets + `isRenewal=true` on renewals + webhook source). 93.7% of affected rows are historical, so low current-ops impact.
  - [ ] Neil to supply canonical names for the ~89 non-AY course families (Morning General, IELTS, Junior, etc.) (from Claude memory: project_course_canon.md)

---

## Clean up remaining duplicate payments from the June backfill (HS_ALSO + MESSY)

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-06-05
**Updated:** 2026-10-13T21:52:26Z

The 3 June 2026 backfill double-recorded payments. The SAFE bucket is done (28 bookings, €25,304). Check first whether the later 2026 backfill/recon work already covered these. (from Claude memory: project_payment_dedup.md)
  - [ ] HS_ALSO (3 bookings, €7,746): SIS dedup + HubSpot `commerce_payment` cleanup (otherwise a webhook re-fire re-inflates)
  - [ ] MESSY (21 bookings, €15,348), case by case: missing payments where bank > SIS (Arthur #1384, Bruno #1353, Amanda #1385, Ivo #1463, Maria Eduarda #1559, Federico #18043); multi-system messes (Tania #1514, Flávia #1534, Laura #1522, Lucas #1493, Mickaela #1375, Bernardo #49)

Truth source = hub `hubapp/Docs/MigrateRecon/recon-task-FULL.csv`. Dedup = merge, not delete.

---

## Set the CES exam-registration address and plan Exam Booking phase 2

**Priority:** Medium
**Status:** Waiting — Neil (verified CES address)
**Added:** 2026-10-13
**Updated:** 2026-10-14T17:51:22Z

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
**Updated:** 2026-10-14T17:51:22Z

Kelly (accomm@, Slack 2026-10-13) flagged Carlotta extended at Capel Street but "doesn't show up in SIS." Diagnosed: she IS in SIS (student #70). Her extension is booking **18357** (HubSpot deal 524720509127, HS invoice 1388324376805), status PENDING, 2026-10-10 → 2027-02-20, 17 wks, €3,400 total, **€0 paid**. Two breakages:
  - [ ] **Unassigned bed.** Extension accommodation placement #11438 was created with `bedId = null`, so she's on no room / no occupancy board. Her original bed 87 (A2/Room 2, Superior, booking 76, ended 2026-10-10) then read as empty and was reassigned — Michele Mancini (1 night) then **Sandrine Bruneau 2026-10-11 → 2026-11-01**. So in SIS she occupies no bed and her old one is taken. NEED from Kelly: which room is she physically in now → then attach #11438 to that bed. (Root-cause: extension placement created without a bed lets the vacated bed look free and get re-let — worth a guard: AY/continuation accommodation rows shouldn't be left bed-null.)
  - [ ] **€800 not recorded.** She sent proof of a direct BOI transfer ("Rent room", €800 = 4 wks @ €200, authorised 05-10-2026, settled 06-10). Direct-to-bank (not PayNow/TransferMate) so no webhook fired → not in SIS, booking still €0/PENDING. Reconcile: confirm accounts/Saraa haven't already keyed it in HubSpot, then record €800 against booking 18357 (leaves €2,600 open). Awaiting Neil's go-ahead (financial write).

---

## Take the KickStart challenger nudge live

**Priority:** Medium
**Status:** Waiting — Neil (approve templates)
**Added:** 2026-10-09
**Updated:** 2026-10-13T21:52:26Z

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
**Updated:** 2026-10-14T12:11:21Z

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
**Updated:** 2026-10-13T21:52:25Z

The internal ETO Agreement signing replaced Zoho Sign, but the Zoho sync cron is still in the crontab (`dist/scripts/sync-contracts.js`, daily 06:45). (from Claude memory: project_partner_contract_signing.md)
  - [ ] Confirm the backfill ran and the gate blocks unsigned agencies in the UI
  - [ ] Disable the Zoho `sync-contracts` cron (keep the code ~3 months as a safety net)
  - [ ] Cancel the Zoho Sign subscription

---

## Live-test the Accelerator 22% default through autoQuote

**Priority:** Low
**Status:** Backlog
**Added:** 2026-09-03
**Updated:** 2026-10-13T21:52:24Z

Partners who sign without a fixed rate are auto-enrolled on the Accelerator ladder. Not yet tested end to end with a real confirmed-partner AY deal emitting 22% through autoQuote. Use a controlled "ABC Test" throwaway. (from Claude memory: project_accelerator_signing.md)

---

## Add a "Personal Assessment Section" (PAS) to the Friday assessment

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-05-18
**Updated:** 2026-10-13T21:52:26Z

Most of the Friday assessment is class-wide (everyone had the same week, so it follows the can-do statements and Pearson GSE vocabulary). Add a short personal section at the end, about 3 questions, tailored to errors the individual student showed in class (as recorded by the teacher) or in their homework. Questions could be written by the teacher or by AI. Assessment generation lives on the LMS side; see the Friday Assessment inputs design (Mon–Thu recap + programme_curriculum + class_output).

---

## Refactor: break up public/admin.html into smaller files

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-04-07
**Updated:** 2026-10-13T21:52:48Z

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
**Updated:** 2026-10-13T21:52:25Z

`admin.html` has 5 duplicated rich-text editors (divergence and maintenance risk; the doc editor already differs). Font/colour controls are already centralised (`rtControls()`). Finish the job with a single `richEditor(id, opts)` helper that emits toolbar + contenteditable. CRITICAL: keep each editor's existing id or sends break. Low risk, own focused task.
Spec: `.claude/docs/MigrationCleanup/editor-centralisation.md`

---

## Student-app translation, phase 2 (app chrome)

**Priority:** Low
**Status:** Backlog
**Added:** 2026-06-29
**Updated:** 2026-10-13T21:52:47Z

Phase 1 is done and live: the KickStart €500 challenge + leaderboard are translated into PT/ES/IT/FR/DE/TR/JA/KO/ZH/RU+EN via `public/challenge-i18n.js`, auto-resolved from `Student.language` → nationality, with a flag toggle. Phase 2 = translate the app chrome only (tab/nav names, section/card headers, key buttons, ~40–60 strings) and move the toggle to a global spot. Skip long-form and staff-written content (that needs live machine translation).
Spec: `.claude/docs/mobile-app/translate.md`

---

## Add the English/Native toggle to the remaining email composers

**Priority:** Low
**Status:** Backlog
**Added:** 2026-06-30
**Updated:** 2026-10-13T21:52:47Z

Template translations (OpenAI → 10 languages) work in the profile composer (`sendCommsEmail`) and the bulk modal. The other per-context composers, pvComms `sendPvEmail` and the generic `commsBlock`/`sendCommsGeneric`, don't have the toggle yet. (from Claude memory: project_template_translations.md)

---

## Add a weekly payroll cron (Sunday pull)

**Priority:** Low
**Status:** Backlog
**Added:** 2026-04-07
**Updated:** 2026-10-13T21:52:26Z

Add a Sunday cron that pulls the weekly payroll data, once payroll is fully tested and operational. There is currently no payroll line in the crontab; the engine is `src/scripts/payroll.ts` (`refreshPayroll`). Context: teachers are paid hourly, on Thursday, with payroll cutting off the Wednesday before; the next month must include the Thu/Fri after the cutoff (Fidelo couldn't do this).

---

## Build the staff UI for the partner booking-form parser

**Priority:** Low
**Status:** Backlog
**Added:** 2026-06-06
**Updated:** 2026-10-13T21:52:48Z

Track B engine is built (`src/scripts/booking-parser.ts` `parseBookingPdf`: pdftotext + gpt-4o-mini). The remaining work is a thin staff UI: upload + pick agency → review (highlight `needsReview`) → existing `enroll()`. Never put the uploader in the partner portal. Track A (magic-link student form per agency) is spec only. Spec: `.claude/docs/parser/booking-intake-spec.md`. (from Claude memory: project_booking_intake.md)

---

## Arm the pre-arrival host reminder

**Priority:** Low
**Status:** Waiting — Neil (go-ahead to arm)
**Added:** 2026-10-10
**Updated:** 2026-10-13T21:52:47Z

`cron-arrival-reminder` runs daily at 09:30 but `data/arrival-reminder.json` is `armed:false`, so it sends nothing. Flip `armed:true` once to enable for all upcoming host-family arrivals (2 days' notice, one reminder per stay). (from Claude memory: project_host_arrival_reminder.md)

---

## Add WhatsApp / SMS channels to host outreach

**Priority:** Low
**Status:** Backlog
**Added:** 2026-07-02
**Updated:** 2026-10-13T21:52:48Z

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
**Updated:** 2026-10-13T21:52:47Z

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
**Updated:** 2026-10-13T21:52:48Z

Host portal slice 2. A Travel Pair = 2 (occasionally 3) students travelling together (same flight → usually same transfer and house). Distinct from a group. UI label "Travel Pair"; DB `travelPairId` UUID. Claims are single-placement only today. (from Claude memory: project_host_portal_v1.md)

---

## Transport V2–V4 (group buses, activity transport, Leap cards)

**Priority:** Low
**Status:** Backlog
**Added:** 2026-05-11
**Updated:** 2026-10-13T21:52:47Z

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
**Updated:** 2026-10-13T21:52:48Z

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
**Updated:** 2026-10-13T21:52:47Z

  - [ ] Deferred ("app stuff second"): front-end passport to-do / onboarding step / green alert after the welcome video. Only the passport-request email was built. (from Claude memory: project_loa_auto_issue.md)
  - [ ] Parked: auto-refresh-from-source when a Student/Booking field is edited (check for docs containing that field, then run `refreshDocumentFromSource`). Deliberately parked 2026-07-05. (from Claude memory: project_living_loa_documents.md)

---

## Cascade course reschedules to booking service window and HubSpot deal dates

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-09-11
**Updated:** 2026-10-13T21:52:48Z

When a course is rescheduled, the booking service window and HubSpot deal dates go stale (a systemic accom/date cascade). Offered, Neil's call. The transfer chase cron and Date-TBC panel are the safety net until then. (from Claude memory: project_transport_arrival_gap.md)

---

## Support true double reservations on one deal

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-08-13
**Updated:** 2026-10-13T21:52:48Z

<2–5% of bookings have 2 different courses or 2 different accommodations at different times (e.g. apartment then host family). Root problem: line items carry no dates; course/accom dates come only from the deal's single flat fields. Invoice/SIS/Xero already handle n courses + accom from line items; only the deal fields can't. Parked. (from Claude memory: project_resync_authoritative.md)

---

## Partner-portal LifePass earnings display

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-06-07
**Updated:** 2026-10-13T21:52:47Z

Spec'd, not built (pre-revenue). Hero "€X/month recurring" (€66.75 × active LifePass students) + staircase chart; accrual source = the `-Sub` master invoice's `hs_amount_paid`, not `instalment.paidAt`. (from Claude memory: project_lifepass_earnings.md)
  - [ ] Opt-in Load/Remove Sample Data (demo source, not an `isSample` flag)
  - [ ] Wire real accrual off the `-Sub` invoice and fix the `liveFinance` `-Sub` leak
  - [ ] v2: "at your current pace" projection

---

## Partner credit: auto-apply at enrolment (phase 3)

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-07-18
**Updated:** 2026-10-13T21:52:47Z

The partner credit ledger and its 3-way Xero/HubSpot push are built. Parked: on booking-form submit, look up the agency's credit balance and surface it into HubSpot (task/flag) at deal/autoQuote time. HubSpot's `credit_memos` API is 403 for standard apps. (from Claude memory: project_partner_credit_ledger.md)

---

## Student self-booking v2: in-app payment and draft quote

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-04-18
**Updated:** 2026-10-13T21:52:47Z

V1 ("+ Book" → continuation deal + autoQuote + staff task) is built. Only explore v2 once v1 is stable:
  - [ ] Direct payment: course always allowed (seats + level known); accommodation needs ≥72h notice (warn if arrival <72h, per T&C); extras anytime. Payment rail (Stripe/TransferMate) TBD.
  - [ ] Client-side draft quote from the pricing JSON catalogue, rendered in the app/portal before touching HubSpot; the student adjusts and sends, then it goes through the manual gate
  - Partner portal note: partner extension bookings are rare (~5%), so the full B2B quote/invoice process stays right for partners.

---

## Agency dedup leftovers

**Priority:** Low
**Status:** Backlog
**Added:** 2026-06-06
**Updated:** 2026-10-13T21:52:48Z

  - [ ] Manually confirm the 3 weak Phase-2 matches: maltamalta.com, MatchMYCourse → Match My Course, WEST1 → WEST 1 (from Claude memory: project_agency_dedup_grandfather.md)
  - [ ] Void Micael Goulart's HubSpot "Partner Onboard" deal 515037176009 (bot-registered partner, SIS rows deleted). Contact 835976200403 / company 376032476352 still carry a stale `sis_portal` stamp. (from Claude memory: project_partner_registration_gate.md)

---

## Cleaning queue: finish issue #54 addendum

**Priority:** Low
**Status:** Backlog
**Added:** 2026-08-26
**Updated:** 2026-10-13T21:52:48Z

Run recipe `issue-54-addendum` (reconcile BA11161 to match the already-cleaned twin BA11160) and write the #54 status to the Cleanup sheet via `node .claude/cron/sheet.js`. Check first; it may already be done. (from Claude memory: project_cleaning_queue_per_room.md)

---

## iOS app: confirm App Store review outcome

**Priority:** Low
**Status:** Waiting — Apple (App Store review; verify outcome)
**Added:** 2026-09-21
**Updated:** 2026-10-13T21:52:47Z

v1.0 was submitted to App Store review 2026-09-21. Keep demo student 14561 (`app-review@`) alive until approved. Optional: add `ITSAppUsesNonExemptEncryption = NO` to `ios/App/App/Info.plist` in `/home/sis/dev/sis-mobile` to skip the export-compliance prompt on future builds (needs a rebuild). (from Claude memory: project_ios_testflight.md)

---

## Payment identification: better references on student transfers

**Priority:** Low
**Status:** Backlog
**Added:** 2026-04-07
**Updated:** 2026-10-13T21:52:47Z

It is still hard to match incoming payments to specific students/bookings; references are often a legacy Fidelo ID. Put better reference codes on invoices (booking ID, student ID in the transfer reference). The SIS student id is already mirrored to HubSpot `student_id` so the TM checkout prefills it.

---

## Invoice line-item descriptions with date range

**Priority:** Low
**Status:** Backlog
**Added:** 2026-04-07
**Updated:** 2026-10-13T21:52:47Z

Auto-populate the HubSpot line item `description` with the date range from deal properties, e.g. "Morning slot, 25 March – 14 April" (deal start_date + weeks → end date). Helps invoice clarity, visa letter references and compliance. autoQuote (hub `scripts/quote-inv/autoQuote.js`) currently sets only "Summer"/diet subtitles, not dates. Staff need to know dates now come from HubSpot, not Fidelo.

---

## HubSpot → Xero line-item order

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-04-07
**Updated:** 2026-10-13T21:52:47Z

The native HubSpot→Xero data sync doesn't preserve line-item order. Cosmetic only (totals/accounting unaffected). If order matters on client-facing invoices, reorder manually or build a custom sync that respects order. Monitor.

---

## Bring old Xero hosts into SIS with an activity status

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-04-07
**Updated:** 2026-10-13T21:52:48Z

Xero likely has many more (older) hosts than SIS. Not sure it's worth importing them. If imported, they need an active/quiet/inactive status based on last booking, and quiet/inactive hosts kept off the Matching screen. Host categories (SuperHost/BusyBee/Regular/Interested/Sleeper/Dormant) now auto-derive from hosting history and could carry this.

---

## Fidelo legacy attendance: full 52-week historical backfill

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-09-21
**Updated:** 2026-10-13T21:52:48Z

Pre-04/05/2026 Fidelo attendance % is backfilled for current students. The full 52-week historical job (final % for departed students) is deferred. Method in `fidelo-history/backfill-instructions.md`; match key = sheet "Student ID" == `fidelo_customer_num`. (from Claude memory: project_fidelo_legacy_attendance.md)

---

## ARACHAS insurance purchase: reduce manual entry

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-05-22
**Updated:** 2026-10-13T21:52:46Z

Antonella buys Learner Protection + Medical one by one on ARACHAS. Check whether ARACHAS has an API; otherwise (a) a bookmarklet/extension that autofills their web form from the open SIS student page, or (b) a "record purchase" form (policy number + PDF upload). Policy PDFs are already auto-classified on upload. (from Claude memory: project_insurance_workflow.md)

---

## Partner user-account invitations (bulk)

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-04-18
**Updated:** 2026-10-13T21:52:48Z

Original plan: for all active partners, create user + password + email, add temporarily to HubSpot, then send an email with personalisation tokens for the login. Probably superseded: partners now self-register at `/sis/partners/register` (allow-list gate) and established partners were grandfathered. Confirm, then close.

---

## B2B quote template "Commission" label in HubSpot (#10)

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-04-18
**Updated:** 2026-10-15T10:05:14Z

Cosmetic, HubSpot side: B2B quote template with a "Commission" label. Probably stale: quotes/invoices are now always NET, and the partner agreement reframed commission as "Wholesale Discount". Confirm, then close.


---

## Fix the Monday host-payments cron (no cd → module not found)

**Priority:** High
**Status:** Waiting — Neil (first run after the fix may catch up on missed weeks)
**Added:** 2026-10-14
**Updated:** 2026-10-14T05:24:20Z

sis crontab line `0 3 * * 1 node dist/scripts/cron-host-payments.js >> …/private/db/host-payments.log` has no `cd …/public_html/sis &&`, so it fails every Monday with `Cannot find module '/home/sis/dist/scripts/cron-host-payments.js'` (28 failures in the log). The other host-payment crons have the `cd`. Check what the job does on a first run after weeks off before fixing.

---

## Attendance roster hides paid/escrow/net-terms students (ILEP gap)

**Priority:** High
**Status:** Waiting — Neil (approve full weekly report + the gate fix)
**Added:** 2026-10-14
**Updated:** 2026-10-14T12:01:29Z

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
**Updated:** 2026-10-14T06:11:27Z

Hosts see two Bills for one stay (Slack, Kelly/accomm@). H-number = `3500 + host_payment_line_item.id`. Each dupe is an orphan draft left when a payment run's Xero push **partially failed** (`xeroBillId=null`); the next run correctly re-billed (new bill submitted to Xero) but the "clear un-pushed drafts" cleanup (`host-payments.ts:98-118`) is keyed to the **same runDate only**, so the orphan persists, and the portal query (`host-portal.ts:314`) lists line items with no `xeroBillId`/status filter → host sees both. **Xero token is HEALTHY** (not a dead-key issue — auto-refreshing `xero-tokens.json`).
  - [ ] Delete orphan SIS line items (xeroBillId null, never in Xero, never paid): **218** (H-3718, Bob&Ann O'Sullivan — keep H-3725/id225), **222** (H-3722, Edel McDonald — keep H-3727/id227), **65** (H-3565, Patty McSweeney — pre-existing dupe). No Xero write needed.
  - [ ] Systemic: (a) portal filter out `xeroBillId:null` drafts from host-facing list, and/or (b) broaden cross-run orphan cleanup, and/or (c) surface failed Xero pushes for retry instead of silently orphaning.
  - [x] Deleted orphan line items 65/218/222 on 2026-10-14 — all xeroBillId null, confirmed never in Xero; Kelly pays H-3725 + H-3727.

---

## Email template hierarchy reorg (Student Operations)

**Priority:** Medium
**Status:** Waiting — Neil (pick Option A/B + confirm 7 ambiguous, then execute)
**Added:** 2026-10-14
**Updated:** 2026-10-14T06:11:27Z

Reorg per `.claude/tmp/doc-hierarchy.md`: introduce Student Operations with Student Administration / Student Success, reclassify ~44 templates by function. Audit complete (full before/after mapping produced, nothing executed). Category-string changes only — slugs/ids/tokens/TEMPLATE_ID_BY_SLUG untouched, so send/automation paths unaffected.
  - [ ] Decision: Option A (2-level nav, parents "Student Admin"/"Student Success", no code change — recommended) vs Option B (~15-line buildTree change for a true 3-level Operations umbrella). Nav buildTree is 2-level today, no "Other" catch-all.
  - [ ] Confirm 7 ambiguous: DOSVisitRequest-Student(11), LEAP(69), Trial(72)/Trial-FollowUp(71), End-Certificate(68), Confirm-Group(58), LifePass-Agreement(112), FeedbackFinal2-ExitLetter(60).
  - [ ] "Attendance & Holiday Self-Service" (#99) to Student Success (Neil override; student-facing self-service).
  - [ ] Execute: ~44 category updates + new EMAIL_TREE/DOC_TREE nodes + remove emptied nodes; fold the 3 still-orphaned accomm/transport categories in too.


## Legacy TransferMate-escrow escape hole — sweep siblings of Jiaming Wang

**Priority:** Low
**Status:** Waiting — TransferMate (report on the card escape hole; no SIS-side search needed)
**Added:** 2026-10-14
**Updated:** 2026-10-14T09:36:20Z

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
**Updated:** 2026-10-14T09:36:20Z

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
**Updated:** 2026-10-14T10:06:23Z

Neil has asked TransferMate for the authoritative "who is in escrow right now" list (TM reporting is CSV-only and clunky). When it lands, cross-reference each name against SIS attendance using the heuristic (documented in KB `kb/finance/escrow.md` + manual `Finance/Escrow.md`):
  - [ ] Attending our school (roster OR named on the paper attendance sheet) ⇒ in the State ⇒ visa approved ⇒ the held money should already have released → flag to chase TM for release; once released, apply the release-conversion (flip the escrow shadow → Standard).
  - [ ] Not yet arrived but visa approved ⇒ legitimately still held; the success-notice to TM just wasn't sent → trigger it.
  - [ ] Neither ⇒ genuinely pending visa decision → leave held.
  - [ ] Uyanga Tungalag (#917, booking #1467, Easy Go): TM email confirms €3,066 held since 20/10/2025 (ref ULEARNP2025900), no release notice ever issued; she is in Ireland renewing (first visa approved) → €3,066 owed to us, should release. SIS escrow tag is CORRECT — do NOT re-tag; release only on TM confirmation. Classic "Saraa special" (partner notified, did nothing, sent LOA prematurely).
  - Root cause is the un-triggered release step, not a code bug; the new system blocks ad-hoc LOA sends so it shouldn't recur.

---

## LMS: Build the Vocab Builder (class vocab archive + weekly 10-word check)

**Priority:** High
**Status:** Backlog
**Added:** 2026-07-01
**Updated:** 2026-10-15T12:20:06Z

Vocab is a key lesson OUTPUT, and the "learn 10 new words in a week" Challenge depends on it. We're strong on planning ("shipshape before we leave port") but weak on output — the "wake of the ship": learning gets scattered, photocopies binned, no architecture. Goal: capture each class's new vocabulary, surface it in the student's class history, and test it at the end of the week.
  - [x] Teacher "fat-finger" capture in the class screen — error correction / vocab / grammar / note / Q&A (`lms-api/src/routes/class-output.ts`, kinds `error|vocab|grammar|note|qa`)
  - [ ] Decide where board-vocab lands: teacher photographs the whiteboard → auto-uploads as an asset on the class OUTPUT (not the lesson plan); exact upload/storage location still to resolve
  - [ ] Surface each class's vocab at the "class history" level — student sees current class and scrolls back through past weeks
  - [ ] Historical archive glued together by SOW theme (semantic grouping — e.g. Computing → Hardware → mouse/monitor; Software → coding; spidergram style, as modern EFL classrooms do) AND chronological (dated)
  - [ ] Vocabulary component in the end-of-week assessment: multiple choice on the week's 10 new words (confirm with the Academic Director / DOS; less relevant at higher levels)
  - [ ] Wire into the "10 new words" Challenge — a challenger must get the 10 right to pass, but be lenient (retries allowed; the point is to pass)
  - [ ] Handle changing context of vocabulary (same word, different semantic context) — design question Neil has grappled with for years

---

## LMS: Give the weekly curriculum detail a home in the LMS

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-05-19
**Updated:** 2026-10-15T12:20:06Z

The plan.html topbar now shows only the week's theme (from `programme_curriculum.theme`); the old `programme.*` pills were removed as noise. The curriculum detail (can-do statements, grammar areas, EVP/GSE vocab lists, supplementary refs, Friday testing, core textbook unit) is useful but needs a proper surface — NOT back in the topbar dropdown. Was task #44; revisit when Paul lands more curriculum content. (from Claude memory: project_lms_sow_topbar_redesign.md)
  - [ ] Options: a "This Week's Syllabus" tab/drawer; an info icon on the topbar opening a side panel; or threading bits into each lesson card (grammar on the Grammar lesson, vocab on Vocabulary)
  - [ ] Always render from `programme_curriculum`, never `programme.*`

---

## LMS: Condense goals verbosity in the student Learning panel

**Priority:** Low
**Status:** Backlog
**Added:** 2026-07-30
**Updated:** 2026-10-15T12:20:06Z

Neil asked (Learning-panel pass, 2026-07-30) to condense the verbosity of the can-do goals in `lms/prototype/lms/today.html` without compromising the SOW content. Topbar compression was done in the same pass; this part was left pending. (from Claude memory: project_beta_learning_gate.md)

---

## LMS: Decommission the lms.ulearnschool.com subdomain

**Priority:** Medium
**Status:** Waiting — Neil / root access
**Added:** 2026-06-11
**Updated:** 2026-10-15T12:20:07Z

LMS files/infra already run inside the SIS vhost (`sis.ulearnschool.com/prototype/`, `/lms-api/`, `/api/lms/`). The old subdomain still answers (302 on 2026-10-13) and is still in the transition allow-lists. (from Claude memory: project_lms_subdomain_migration.md)
  - [ ] Remove the subdomain via Hestia/nginx and stop the lms-side Phusion app (root)
  - [ ] Add `pg_dump lms_lms` to backups (root)
  - [ ] Then drop `https://lms.ulearnschool.com` from SIS `sis/src/app.ts` SSO_ORIGINS and `sis/src/routes/tests.ts` TEST_ORIGINS
  - [x] Drupal quiz iframe repointed to `sis.ulearnschool.com/prototype`

---

## LMS: Activate the HubSpot Quiz Workflow for placement-quiz leads

**Priority:** Medium
**Status:** Waiting — Neil (HubSpot workflow switch-on)
**Added:** 2026-07-04
**Updated:** 2026-10-15T12:20:07Z

The public quiz (`ulearnschool.com/quiz` → `sis.ulearnschool.com/prototype/?embed=1`) is a lead harvester: sitting 20 questions = high intent. Score + level are written to HubSpot (`level`, `quiz_score`) and the lead gets an auto-reply, but the HubSpot "Quiz Workflow" (Deal creation + sequencing, trigger "Level is known AND Quiz Score is known") was created 2026-04-17 and NEVER turned on. (from Claude memory: project_quiz_lead_funnel.md)
  - [ ] Turn the workflow on and make sure the trigger uses `quiz_score` (code WRITES `quiz_score` but reads back `latest_quiz_score` in one spot — align)
  - [ ] Quick check on quiz submit: search the SIS by email; if the visitor already exists as a student, push the result to the SIS too (from original ToDo "Users come in 2 main categories")
  - Reminder: whenever the test is embedded on a new ULearn origin, add it to `TEST_ORIGINS` or its POSTs die silently (CORS)

---

## LMS: Admin dashboard for SyllabAi prompts (Paul-editable, version-controlled)

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-07-01
**Updated:** 2026-10-15T12:20:07Z

The lesson-planner system prompt lives at `lms-api/prompts/lesson-planner/system.md` (mostly Paul's lesson-plan-template language); today only a developer with shell + git can edit it. Build a simple admin dashboard so Paul can read, edit, diff and roll back. Why: educators are wordy — a hallucination risk; a visible character count + "prefer 5 words to 50" hint nudges tighter language.
  - [ ] Textarea for the system prompt + `day-slot-conventions.md`; submit edits; diff vs previous version before committing; roll back to any prior version (revision list with timestamp + author)
  - [ ] Markdown stays the source of truth on disk — dashboard reads/writes the same `.md` files the loader consumes; no DB-backed second copy
  - [ ] Versioning via a small `prompt_revisions` table `(file_rel, content, edited_by, edited_at, note)` — a row on every successful write
  - [ ] Restart hook: write file → re-read into memory (or `touch tmp/restart.txt`); no full deploy for a prompt tweak
  - [ ] Gate with `admin` / `dos` role; teachers don't need it
  - [ ] Keep JSON output-schema files OFF the dashboard (schema edits break UI rendering — developer territory); only `.md` prose files editable
  - [ ] Also surface `prompts/quiz-author/system.md` and `prompts/ai-tutor/system.md` (same rules; ai-tutor `output-schema.json` stays off)
  - [ ] Optional later: "diff vs last good production result" preview — run one draft against a sample programme row with the new prompt side-by-side with current output

---

## LMS: Student lesson feedback — open follow-ups

**Priority:** Low
**Status:** Backlog
**Added:** 2026-07-01
**Updated:** 2026-10-15T12:20:07Z

Per-lesson student rating is LIVE (`/lms-api/feedback`, identified, own-rows only, bound to `sis_class_occurrence_id` + `lesson_index`; see ToDo-Done.md). Open questions from the original spec remain:
  - [ ] Edit window — probably "until end of next day", so feedback can't be silently revised after grades/reports land (not verified as enforced)
  - [ ] Reminder if not submitted — push / email nudge?
  - [ ] Anonymised mode — revisit later
  - [ ] Marketing reuse — out of scope for v1; revisit once volume exists and an opt-in model for republishing is agreed

---

## LMS: Null out legacy programme.* text columns

**Priority:** Low
**Status:** Backlog
**Added:** 2026-05-17
**Updated:** 2026-10-15T12:20:08Z

`public.programme` text columns (`objective, theme, grammar, vocab, exam_focus, core_text`) are a stale IELTS-programme seed; only the row `id` matters (FK target). The real GE curriculum is `public.programme_curriculum`. NULL the text columns eventually so nothing accidentally renders IELTS placeholder strings on GE classes (needs a DB write — get approval). (from Claude memory: project_lms_programme_vs_curriculum.md)

---

## LMS: Friday Assessment AI — deferred input upgrades

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-05-14
**Updated:** 2026-10-15T12:20:08Z

The Friday Assessment prompt deliberately uses Mon–Thu recap + class outputs + `programme_curriculum`, and ignores the empty SOW Friday Review rows. Parked upgrades (Paul's call 2026-05-14): (from Claude memory: project_friday_assessment_inputs.md)
  - [ ] Wire `programme_curriculum.exam_prep` + `programme.exam_focus` into `buildAssessmentPrompt` once the SOW importer populates them uniformly across A2/B1/B2/C1 (currently A2 only, sparse)
  - [ ] B2 + C1 assessment-author prompt: emphasise IELTS-style task formats more
  - [ ] Formally link `programme_curriculum.can_do` to CEFR can-dos for levels beyond A2 (TrustED-driven)

---

## LMS: AI Tutor — deployment beyond the placement writing task

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-07-01
**Updated:** 2026-10-15T12:20:08Z

The AI Tutor (`lms-api/src/ai/tutor.ts`, prompt in `prompts/ai-tutor/`) grades writing (corrections + estimated CEFR) and is live ONLY on the placement-test writing task. Its defensible value there is a second, independent CEFR read to cross-check the multiple-choice score — the delta is the signal. PARKED (Neil, 2026-07-01): extending it to weekly/Friday progress tests or oral. Resolve with the DOS first:
  - [ ] Device autocorrect kills the correction half on phones — only an autocorrect-free channel (or handwriting + a vision reader, which even gpt-4o struggles with) recovers true error data
  - [ ] Oral is a different dimension (pressure-cooker, no lookup) — likely the human anti-cheat anchor (~3× weight); record + dictation is experimental, no clear pathway yet
  - [ ] Friday/weekly progress test is unbuilt and its format undecided (maybe quiz + written, maybe a vocab multi-choice of the week's 10 new words — see Vocab Builder). Don't wire the AI Tutor in until the format is settled with the DOS

---

## LMS: Auto-abandon orphan live_session rows

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-07-01
**Updated:** 2026-10-15T12:20:08Z

Quiz live sessions get stuck in `lobby`/`running` when a host closes the tab without clicking Finish. A stale `running` session blocks PUT /quiz/:id ("cannot edit while a session is running" 409 in the composer). Deferred until it has happened in production a couple of times — manual SQL cleanup is fine for now.
  - [ ] Background job (cron / setInterval at startup): `lobby` older than ~1h → `abandoned`; `running` with `current_started_at + 4h < now()` → `abandoned`
  - [ ] Optional: "your active sessions" panel in `quiz-list.html` with a kill button per row

---

## LMS: Migrate legacy Directus reads off to /lms-api/

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-05-05
**Updated:** 2026-10-15T12:20:09Z

Neil wants to ditch Directus eventually. Don't grow its surface; move legacy `/items/...` reads (e.g. `/items/sow_lesson`, `/items/lesson_activities`, `/items/materials` — still 5 references in `prototype/lms/today.html` as of 2026-10-13) to `/lms-api/` routes, using `/lms-api/class-lesson/...` as the template. (from Claude memory: project_directus_offramp.md)

---

## LMS: Content changelog — "git for the syllabus"

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-07-01
**Updated:** 2026-10-15T12:20:09Z

System-wide changelog of the canonical content surface plus per-occurrence teacher deltas, so any past `class_occurrence` can be reconstructed exactly as taught even after the DOS edits the canonical SOW / Lesson Plan / Resources. Substantial design topic, not a sprint item.
  - [ ] DOS-edit archival: before a canonical Lesson / SOW / Resource is modified, snapshot the previous version into the OUTPUT archive of every past occurrence that pointed at it
  - [ ] Snapshot pointers: each `class_occurrence` carries a `content_rev`; reconstruction = canonical@rev + delta
  - [ ] Delta-only storage: un-customised occurrences store nothing; only real uploads (and superseded canonical revisions) consume Drive storage in OUTPUT
  - [ ] Drive versioning shape TBD: per-asset suffix `name_v3.pdf`, or per-occurrence `8.OUTPUT/{level}/.../{date}-{session}/0.canonical_snapshot/` populated only when an edit invalidates past occurrences
  - [ ] Schema to consider: `content_revision` table (table+row+rev → blob/Drive id); `class_occurrence.content_rev` FK; `class_occurrence_asset.replaces_revision_id`

---

## LMS: Device-native (biometric) auth for the mobile app

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-07-01
**Updated:** 2026-10-15T12:20:09Z

Once the LMS ships inside the Android/iOS apps, first sign-in uses the standard username/password page; later unlocks use the device's biometric/passcode. Web stays cookie-based (`connect.sid` on `.ulearnschool.com`). Captured so the mobile stack picks the right auth shape from day one.
  - [ ] iOS: Face ID / Touch ID via `LocalAuthentication`; Android: `BiometricPrompt`; desktop web fallback: WebAuthn / Passkeys
  - [ ] After first password login store a long-lived per-device refresh token in the secure enclave (Keychain / Keystore); biometric prompt unlocks it → exchanged for a short-lived session cookie
  - [ ] "Manage devices" screen in the student profile to revoke a lost phone without rotating the password

---

## LMS: Ecosystem — third-party schools and self-directed learners on the app

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-07-01
**Updated:** 2026-10-15T12:20:10Z

Vision: users create their own lesson plans like teachers do (upload authentic materials, perhaps in their own language, translated into English); the AI tutor guides them with error correction and assessment and outputs challenges as can-do statements. Sell the app to other schools to form an ecosystem where a user can join a real-world class inside the ULearn ecosystem on that week's can-do statement.
  - [ ] Create / popularise a de facto standard based on end-user students and commercial-user schools

---

## Retry the SIS Xero invoice create on no-contact

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:18Z

createXeroInvoiceFromHubSpot gives up permanently when DataSync is ~45 s late creating the contact. Proper fix not built. (moved from Claude memory: hubapp memory project_xero_nocontact_race)

---

## Confirm the SIS prune of payments for the 59 deleted HubSpot orphans

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:18Z

2026-06-05 (€34,135). Also check the 40 invoices for duplicate paid effects, especially INV-1010. (moved from Claude memory: fins memory project_xero_hubspot_payment_reconciler)

---

## Audit AY bookings missing the Christmas closure shunt

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:18Z

About 16 legacy #1xxx AY bookings and some recent ones lack applyChristmasClosures (2026-10-10). #18338 and #17920 have a NULL serviceEnd. (moved from Claude memory: project_holiday_spec)

---

## Live-test Seat Clearance pricing through autoQuote

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:18Z

Not yet run (2026-09-03). Expect €1,799 (AM) / €1,749 (PM) net. Sale deadline 31/10/2026. (moved from Claude memory: project_occupancy_seat_clearance)

---

## Turn on the Student Agreement gate

**Priority:** Medium
**Status:** Waiting — Neil
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:19Z

Built 2026-07-14. (moved from Claude memory: project_student_contract_signing)
  - [ ] Run the grandfather backfill --commit (~85 students)
  - [ ] Set STUDENT_CONTRACT_GATE=on and restart
  - [ ] Smoke-test

---

## Auto-create the StudentGroup from the invoice-created webhook for group deals

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:19Z

Flagged by Neil 2026-09-15; phantom booking #18301 came from this gap. (moved from Claude memory: project_group_management)

---

## Confirm the queued escrow fixes ran (sis/tmp/escrow-reconcile-1-2.js)

**Priority:** Medium
**Status:** Waiting — Neil
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:19Z

Usukhbadrakh/Burte-ujin and Jiaojiao/Turbold (2026-09-09). (moved from Claude memory: project_escrow_endrun_audit)

---

## Attendance register compliance fixes

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:19Z

Signed register is a legal requirement (2026-07-31). (moved from Claude memory: project_attendance_sheet_reconciliation)
  - [ ] Relabel overflow rows "Name (print) / Signature"
  - [ ] Assign Conversation +5 (class 16) and audit IELTS (class 10) so they print a roster
  - [ ] HubSpot-won vs SIS sweep
  - [ ] Identify "Suguru"

---

## Refund module data and wiring follow-ups

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-16T15:05:06Z

As of 2026-09-21. (moved from Claude memory: project_refund_module)
  - [ ] Refunds #51, #60, #65, #66 have no student
  - [ ] Verify multi-booking links on #35 and #63
  - [ ] Normalise status case variants
  - [ ] RFA sequence is unused
  - [ ] Supervised first live Xero refund
  - [ ] Refunds filter on the Students page

**Refund reason/cancel policy — fixed + follow-ups (Neil, 2026-10-16):**
Policy (Neil): visa_refusal = money back BEFORE course starts (often escrow), DOES cancel. cancellation = before start, not necessarily escrow, DOES cancel (penalty timelines; none once course begins). service_issue = AFTER course begins (e.g. no bed), does NOT cancel. other = everything else, does NOT cancel. So `REFUND_CANCELS_BOOKING = ['visa_refusal','cancellation']` is correct as-is — the bug was the silent default.
  - [x] **FIXED — silent `visa_refusal` default removed.** `src/scripts/refunds/index.ts` `create()` now requires an explicit reason (throws if missing/invalid) and blocks `visa_refusal` for `EU` / `Non-EU (No Visa)` territories. Covers manual form + operator path. tsc clean, restarted 2026-10-16. (intake()/Drupal webform left as-is — student-facing, always collects a reason; add the same EU guard there if EU visa-refusal submissions recur — saw #61 Italy, #62 Italy.)
  - [x] **FIXED — Sandrine's HubSpot deal 522465150195 reverted** → `closedwon`, `closed_lost_reason` cleared (2026-10-16, via SIS ACCESS_TOKEN PATCH; claude.ai HubSpot connector lacks deal-write scope).
  - [ ] **Xero Bill RFV-1002** (Sandrine, €350, submitted, unpaid) raised under visa prefix (RFV) — accounts@ to reissue as RFC (service) or amend; it's a service-issue refund, not visa.
  - [ ] **Move Sandrine out of A2/R2** (Neil: can't put her in that room). Booking CONFIRMED again so she's visible in Matching after a hard-refresh; Kelly to reassign to a better/private room for 11 Oct–1 Nov. Her wk-1 row (11435, 4-11 Oct) bedless + elapsed.

---

## ReSync leftovers

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:20Z

From 2026-07-28. The SKU fix waits on Neil. (moved from Claude memory: project_resync_authoritative)
  - [ ] Unmerged accommodation splits: Fayez #18236, Luana #18188, Fabrizio #17826
  - [ ] Tsengelbayar #948 bk 18194: RNW-PM → RNW-AM (€300 difference), or ReSync reverts to Afternoon
  - [ ] Reconcile the 2027 peak windows

---

## Seat Clearance follow-ups

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:20Z

(moved from Claude memory: project_occupancy_seat_clearance)
  - [ ] Countdown to the next sale
  - [ ] Contact-only partners aren't auto-detected
  - [ ] Clear the flag on conversion

---

## Group transport and detail follow-ups

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:20Z

(moved from Claude memory: project_group_management)
  - [ ] No transport edit UI to fire syncGroupTransportJobs
  - [ ] No excursions field; pack derivation
  - [ ] Colegio Vitoria rename
  - [ ] Laura Kilijanski group #6 has no agency

---

## Resolve three HubSpot-side flags from the dup-booking cleanup

**Priority:** Low
**Status:** Waiting — Neil
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:21Z

From 2026-06-07. (moved from Claude memory: project_dup_booking_reconnect)
  - [ ] Federico #90: €1201 paid vs INV-1240 showing €328.30 due
  - [ ] Gretel #17917 is on the wrong deal
  - [ ] Maicol Moretti shell deal 494814703802

---

## LifePass withdrawals: Pedro #1040 and a withdrawal UI

**Priority:** Low
**Status:** Waiting — Diego
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:21Z

Parked 2026-09-28 pending Diego. Bucket 2 keeps the €50 fee. (moved from Claude memory: project_lifepass_subscription_accounting)

---

## Finish or drop the May–June handwritten attendance backfill

**Priority:** Low
**Status:** Waiting — Neil
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:21Z

From 2026-06-08. (moved from Claude memory: project_attendance_backfill)

---

## Certificate of Completion should use the latest segment's level and code

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:21Z

Also verify Telmuun bk 1624. (moved from Claude memory: project_ilep_codes)

---

## Card-on-file follow-ups

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:22Z

Add an email token to the €1 webhook; decide on LifePass/Challenge badge and mirror coverage. (moved from Claude memory: project_accom_card_on_file)

---

## Review the 13 paid > total bookings and the parked balance-ghost sweep

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:22Z

The 38-safe sweep was built but never run. (moved from Claude memory: project_balance_field_semantics)

---

## Treat the Xero "must supply a LineItemID" error as "already paid, skip"

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:22Z

(moved from Claude memory: project_escrow_flag_release)

---

## Move the remaining internal alert emails into alerts/emails.ts

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:22Z

notify-121, partners.ts, refunds notifyAccounts, holiday and support-forward emails (2026-09-24). (moved from Claude memory: feedback_email_centralisation)

---

## Clean up spam partner portal accounts

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:23Z

40 users with no hubspotContactId, bots #52/#54/#63/#140, test #9. Keep #34. (moved from Claude memory: project_partner_registration_gate)

---

## Verify two possible duplicate students

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:23Z

Jiaojiao Yu 957 vs 14503; "Liu / Unknown" #14507 with a €109k booking. (moved from Claude memory: project_student_dupes_saraa)

---

## Arrival one-click split send (#30 Apartment / #33 Host)

**Priority:** Low
**Status:** Waiting — Neil
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:23Z

Approved in principle, held (2026-10-10). (moved from Claude memory: reference_email_templates)
  - [ ] Add an "Other" catch-all to the template trees (2026-10-14)

---

## iOS-launch follow-ups

**Priority:** Low
**Status:** Waiting — Apple
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:23Z

(moved from Claude memory: project_play_store_launch)
  - [ ] Change the "iOS coming soon" copy (tests.ts, templates #92 and #76)
  - [ ] Add the Apple badge; use the official Play badge
  - [ ] Upload the APNs key

---

## Rotate the Slack tokens and add the missing notify env vars

**Priority:** Low
**Status:** Waiting — Neil
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:24Z

Tokens exposed 2026-08-17. Missing: SLACK_ANTONELLA_USER_ID, SLACK_DIEGO_USER_ID, SLACK_CHALLENGES_CHANNEL, SLACK_TRANSPORT_CHANNEL. (moved from Claude memory: reference_slack_read)

---

## Extend pinch-zoom to the partner-portal doc viewer and contract preview

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:24Z

(moved from Claude memory: reference_doc_viewer_pinch_zoom)

---

## Let staff record a host's phone offer

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:24Z

From 2026-10-10. (moved from Claude memory: reference_matching_ui_additions)

---

## Finish app-guide video dubbing (de/tr/ru/ko/ja/zh)

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:25Z

Tune the Korean and Japanese timing. (moved from Claude memory: reference_video_dub_srt)

---

## Re-check Irish sick-pay figures each January

**Priority:** Low
**Status:** Planned
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:25Z

Due Jan 2027. The ÷5 daily figure understates pay for part-week staff. (moved from Claude memory: reference_ie_sick_pay_kb)

---

## Normalise the 9 students with ISO-2 nationality ("MN")

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:25Z

Check first; may already be done. (moved from Claude memory: project_fidelo_retired)

---

## Delete the stray /home/sis/dev/mobile clone

**Priority:** Low
**Status:** Waiting — Neil
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:25Z

From 2026-10-12. (moved from Claude memory: project_git_hygiene)

---

## Mirror the central KB read-only under the sis user

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:26Z

(moved from Claude memory: feedback_knowledge_base_first)

---

## Add a controlled-documents permission tier once the data is clean

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:26Z

(moved from Claude memory: feedback_no_doc_legal_lock_yet)

---

## Kick Start leaderboard snapshot and translation follow-ups

**Priority:** Low
**Status:** Someday/Maybe
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:26Z

Frozen month-end snapshot table; native check of JA/KO/ZH/RU; translate the late-screenshot notice. (moved from Claude memory: project_kickstart_impact_prize)

---

## Check the 56 non-clean cases after the AY end-date recompute

**Priority:** Low
**Status:** Backlog
**Added:** 2026-10-15
**Updated:** 2026-10-15T12:25:26Z

Flagged 2026-06-05 with no sign they were resolved (lower confidence). (moved from Claude memory: reference_utc_date_math)

---

## Document letters — gender wording (de-risked; optional full pass)

**Priority:** Medium
**Status:** Waiting — Neil (resend decision + optional scope)
**Added:** 2026-10-19
**Updated:** 2026-10-19T22:30:06Z

Student 14707 (Ankhbayar Oyundelger, Mongolia) reported his Student Letter said "she." Root cause:
`src/scripts/documents.ts` defaulted **unknown gender → Ms./she/her**, and `gender` is an
essentially-unpopulated legacy integer (1=Male, 2=Female): **14,074 students null**, only 460 set;
**36 null-gender students have a live/future course**. The LoA templates were already pronoun-free,
but ~14 other letters (Student-Letter #84, Confirm-*, Holiday-Letter, Exit-Letter, Attendance-*…)
still use the `{{student.pronoun_*}}` / `{{student.salutation}}` tokens.

- [x] Engine fix: gender-aware tokens; **unknown → neutral singular "the student / the student's"** (grammatical with hard-coded singular verbs), salutation blank; known gender still renders he/she accurately. tsc clean + restarted.
- [x] Set 14707 gender=Male (he told us) → his letter now renders "Mr./He".
- [x] Re-rendered his issued Student Letter in place (record 958, same link/QR) → now "he/his".
- [ ] **Resend** the corrected letter to the student? (he needs it for visa renewal — offered to Neil/Theresa)
- [ ] Optional: a template-body pass to drop gendered wording even for KNOWN-gender students, if Neil wants letters fully gender-free (today known gender still prints he/she). Also consider syncing gender from HubSpot where known so those students get accurate he/she instead of "the student".

---

## Check SIS course mapping for the Learner Protection SKU (LP → PEL)

**Priority:** Medium
**Status:** Backlog
**Added:** 2026-10-21
**Updated:** 2026-10-21T11:25:06Z

webhooks.ts / hubspot-sync.ts treat any SKU starting "LP" as a LifePass (Academic Year) course. Learner Protection had SKU "LP" (Jun–21 Oct 2026; renamed PEL in HubSpot on 21 Oct), so invoices with an LP line may have made a phantom AY course in the booking. Check bookings from invoices with an LP line, e.g. Yael 18390. New PEL lines are safe.

---
## Build Referral Setup — codes, discounts & reward payouts (Amici di Dublino)

**Priority:** High
**Status:** In progress
**Progress:** Spec written (`.claude/projects/referral-setup.md`). Phase 1: [x] `referral_programs` cache table + `ReferralProgram` model (live, verified); [x] HubSpot props created — 6 on Company + 6 on Contact (group `sales_properties`) + Deal `referral_code` (group `dealinformation`). Design locked w/ Neil: props on Company AND Agent-Employee Contact (sole-trader + Ambassador reuse); autoQuote is always downstream (stamp-on-deal); Xero payout account = existing `PartnerPayments`. [x] `src/scripts/referral.ts` engine (upsert→proxy-PATCH company+Agent-Employee contact, syncFromHubSpot cache mirror, code-uniqueness incl. ambassadorCode, resolveReferralCode, validateForStudent) + `src/routes/referral.ts` (PUBLIC `/sis/referral/validate` w/ CORS for ulearnschool.com; staff `/sis/api/referral` CRUD + `/agencies` picker, writes admin/accounts-only) + mounted in app.ts. [x] **Admin "Referral Programs" view** in admin.html (Docs section sidebar) — list, agency-search create, edit form (code/label/discount/reward model+%/settlement/active), Save→PUT (shows HubSpot push count), Sync-from-HubSpot; writes UI-gated to admin/accounts. [x] **AMICI live** — agency 643 / HubSpot company 450325692610: code `AMICI`, 10% student discount, AMBASSADOR_FLAT 10% reward, PAYOUT settlement, active. Verified: public validate→`{valid:true,studentDiscountPct:10}` (reward not leaked), all 6 props on the HubSpot company, SIS cache mirrored. tsc 0, restarted. **NB starting %s are Marco's Ambassador proposal — Neil to confirm/adjust in the new UI.** Next: Drupal `discount_code` wire (validate + stamp via booking_enrichment) → hub autoQuote reads referral_code → `/invoice-created` → Booking.discountCode+agency.
**Added:** 2026-10-21
**Updated:** 2026-10-22T19:50:06Z

Driver: Amici di Dublino (Marco Torelli) — Italian referral community, fixed code `AMICI`,
student discount (≈10%) + partner reward (Accelerator 22–44% tiered), paid out weekly via
Accounts Payable. First *referral/ambassador payout* partner (vs existing B2B net-invoice).
Spec = Neil's "how I propose we move forward" email; percentages configurable per partner.
Full spec + recon (SIS/HubSpot/hub/Drupal) in `.claude/projects/referral-setup.md`.

Key architecture: config authoritative on **HubSpot Company props** (SIS caches + owns the
reward ledger only); student discount rides the existing Challenge line-item mechanism; partner
reward is a **net-new Accounts-Payable payout** (accrue on payment → Wednesday Xero ACCPAY Bill
→ remittance → Portal Financial tab). The booking form `discount_code` field already exists but
is inert; `Booking.discountCode` + `Student.ambassadorCode` are defined-but-unconsumed.

- [~] **Phase 1** — structure + capture + attribution (makes AMICI real): [x] `ReferralProgram` cache
      model; [x] HubSpot company+deal props; [x] SIS referral CRUD (proxy-PATCH company) + admin view;
      [x] AMICI program created live; [ ] wire Drupal `discount_code` → HubSpot; [ ] hub autoQuote applies
      student discount + attribution; [ ] `/invoice-created` → `Booking.discountCode` + agency.
      **Drupal audit 2026-10-22 (CONFIRMED NOT DONE — handover gap):** booking webform HAS the front-end field
      (`discount_code` textfield, placeholder `#ReferralCode`) but it is NOT forwarded to HubSpot — absent from
      the `hubspot_webform_handler` `field_mapping` AND from the custom handler's hardcoded auto-forward list
      (`HubspotTrackingWebformHandler.php`, tracking_fields = gclid/ga_*/utm_*/hsa_*). So entered codes die at
      submission; no deal ever gets `referral_code`. To close capture: (1) add `discount_code` to the webform
      handler mapping/auto-forward (ulearn access, careful edit to a live form); (2) add a matching field on
      HubSpot form `42b3dec0-90f2-4bfb-971f-62e4bf7f1d45` mapped to the `referral_code` property (Contact+Deal
      props already exist). Also: `normCode` in referral.ts must strip `#`/punctuation + fuzzy-match typos
      (amichi/amicci/amishi) so "#amici"/"amici"/variants all resolve — Neil 2026-10-22.
- [x] **DEMO SLICE BUILT 2026-10-22 (tsc 0, deployed):** forgiving resolver (`normCode` strips `#`/punctuation;
      `resolveReferralCode` fuzzy fallback = unique nearest active code within edit-distance 2, guards ≥4 chars /
      ≤half code length / no tie) — verified amici/#Amici/AMICHI/amicci/amishi→AMICI, AMI/bogus rejected, live over
      HTTPS; `/invoice-created` reads deal `referral_code` → stamps `Booking.discountCode` (+self-heal backfill);
      partner-portal **Referrals** tab (partners.html + `GET /sis/partners/api/referrals` → `partnerReferrals`):
      program summary + totals + per-booking table, tab shown only when a program exists. AMICI login exists
      (info@amicididublino.com / agency 643). **To watch live:** stamp `referral_code=AMICI` on a test HubSpot deal
      → invoice → attributes → shows in portal. Reward is indicative (flat % of value); payment-accrued ledger =
      Phase 2. Still TODO for hands-off prod: Drupal capture (above) + hub autoQuote applying the 10% discount.
- [ ] **Phase 2** — `ReferralReward` ledger; accrue on `/invoice-paid`; Portal Referral table +
      Finance "Referral Rewards" card; refund/cancel clawback.
- [ ] **Phase 3** — Xero ACCPAY payout (`createReferralPayoutBill`, clone bills/refund.js) +
      weekly Wednesday settlement run + remittance (clone partner-remittance.js) + admin batch UI.
- [ ] **Phase 4** — fold student `ambassadorCode` into the same resolver (close student.html 10%+10% promise).

Open commercials for Neil (not Phase-1 blockers): exact %s per Amici; reward base; Xero COS
account code for payouts; min payout threshold; VAT on the Italian-entity bill; discount-stacking
vs Challenge (recommend exclusive).

---

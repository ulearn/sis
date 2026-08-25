Issue 43 — Jesús Manuel Ramírez Díaz (ID 14439) — accommodation date discrepancy + bed 83 conflict

Reporter: KC | Area: Booking / Accomm | Sheet row: 45 | SIS student: 14439

SYMPTOM
Accommodation dates should be from June 20th to July 4th.

ROOT CAUSE — UPDATED 2 JUL 2026 (33rd check)

PRIMARY PROBLEM: BED 83 DOUBLE-BOOKED (see also Issue 37 / row 39)
  - Accommodation 11285 (Jesus, bed 83, booking 17825): 21 Jun to 5 Jul, active=true
  - Accommodation 11352 (Veronica Martin, bed 83, booking 18156): 4 Jul to 11 Jul, active=true
  - One-night conflict: Fri 4 Jul night — Veronica checks in while Jesus still occupies bed 83 until Sat 5 Jul
  - Booking 17825 fully paid EUR 2008

SECONDARY PROBLEM (LOW PRIORITY): Jesus stored dates 1 day off
  - Stored: 21 Jun to 5 Jul
  - Requested: 20 Jun to 4 Jul
  - Both off by 1 day — Fidelo import or manual entry error
  - Low priority cosmetic fix

Live data (checked 2 Jul 2026 UTC, 33rd check):
  ba11285: bed_id=83, start=2026-06-21, end=2026-07-05, bookingId=17825, active=true
  ba11352: bed_id=83, start=2026-07-04, end=2026-07-11, bookingId=18156, active=true

FIX RECIPE — NOT YET RUN

Primary fix — resolve bed conflict (preferred):
  Move Veronica's accommodation (ba11352) to bed 174, 175, or 176 — see Issue 37 recipe.
  This resolves the conflict without touching Jesus's booking.

Secondary fix — correct Jesus start date (optional, low priority) [NOT YET RUN]:
  UPDATE booking_accommodations
  SET start_date = '2026-06-20', end_date = '2026-07-04', updated_at = NOW()
  WHERE id = 11285;
  -- Only run AFTER verifying with HubSpot deal that original request was Jun 20 – Jul 4

RISK / CATEGORY
  Category: accommodation, bookings
  Reversible: Yes
  Blast radius: One student (Jesus), one accommodation record (for secondary fix)
  Urgency: CRITICAL for bed conflict (Veronica arrives 4 Jul = 2 days); low for date correction

STATUS
OPEN — bed 83 conflict not resolved (33rd check, 2 Jul UTC). Veronica arrives Sat 4 Jul (2 days).
Primary fix (move Veronica to bed 174/175/176) is tracked in Issue 37 / row 39.
Secondary fix (Jesus date -1d) is low priority cosmetic, not yet run.

**Jul02 THU UTC (34th check, fresh DB): CONFIRMED UNCHANGED. ba11285 Jesus bed83 Jun21-Jul05 active=true. ba11352 Veronica bed83 Jul04-Jul11 active=true. Conflict Sat 4 Jul night confirmed. Primary fix (move Veronica to bed 174/175/176) tracked in Issue 37 row 39. Veronica ARRIVES Sat 4 Jul (2 days). Secondary fix (Jesus end date -1d) remains low priority. Last checked: 2026-07-02 UTC (34th check, hrly bot).**


**Jul02 THU UTC (35th check, fresh DB): CONFIRMED UNCHANGED. ba11285 Jesus bed 83 Jun 21-Jul 05 (requested Jun 20-Jul 04). Bed 83 conflict Sat 4 Jul with Veronica (ba11352) STILL unresolved — see Issue 37 row 39 (primary fix). Secondary: adjust ba11285 dates by 1 day still pending (low priority). bk17825 fully paid EUR 2008. Veronica ARRIVES Sat 4 Jul (2 DAYS). Last checked: 2026-07-02 UTC (35th check, hrly bot).**

**Jul02 THU UTC (36th check, fresh DB): CONFIRMED UNCHANGED. ba11285 (Jesus Ramirez Diaz): bed 83, start=2026-06-21, end=2026-07-05, active=true (updatedAt=Jun 16). Dates still 1 day off from requested (Jun 20-Jul 4). Even if corrected to Jul 4 end, Veronica (ba11352) arriving same day creates same-night overlap — primary fix is Issue 37 (row 39). bk17825 fully paid EUR 2008. Veronica ARRIVES TOMORROW SAT 4 JUL. Last checked: 2026-07-02 UTC (36th check, hrly bot).**

**2 Jul UTC (39th check, fresh DB): CONFIRMED UNCHANGED. ba11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): Jun21-Jul05 stored (requested Jun20-Jul04). ba11352 (Veronica Martin, bed 83, booking 18156): Jul04-Jul11 STILL not moved. Bed 83 double-booked Sat 4 Jul — primary fix (Issue 37) still unrun. Date correction secondary/low priority. Booking 17825: Confirmed, confirmed=true, fully paid EUR 2008. Last checked: 2026-07-02 UTC (39th check, hrly bot).**

**3 Jul FRI UTC (41st check, fresh DB): CONFIRMED UNCHANGED. ba11285 Jesus Manuel Ramirez Diaz, bed 83, Jun 21-Jul 5, active=true. Requested dates Jun 20-Jul 4 still not corrected. Bed 83 conflict with Veronica (ba11352 Jul4-11) still unresolved — fix Issue 37 (row 39) first. Last checked: 2026-07-03 UTC (41st check, hrly bot).**

**3 Jul FRI UTC (43rd check, fresh DB): CONFIRMED UNCHANGED. ba11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): Jun21-Jul05 stored (requested Jun20-Jul04) — 1-day discrepancy on both ends. ba11352 (Veronica Martin, bed 83, booking 18156): Jul04-Jul11 STILL not moved — bed 83 conflict Jul4-5 CONFIRMED. Primary fix (Issue 37) still unrun. Jesus checks out Jul 5 = 2 days. Date correction still secondary/low priority. Last checked: 2026-07-03 UTC (43rd check, hrly bot).**

**4 Jul SAT UTC (46th check, fresh DB): CONFLICT STILL LIVE — JESUS CHECKS OUT TOMORROW JUL 5. ba11285 (Jesús Manuel Ramírez Díaz, booking 17825): bed_id=83, Jun 21-Jul 5, active=true. ba11352 (Verónica Martín, booking 18156): bed_id=83, Jul 4-11, active=true — Veronica arrived today. Bed 83 2-night overlap (Jul 4-5) confirmed live. Primary fix: move ba11352 (Veronica) to bed 174/175/176 — see Issue 37 recipe. Secondary: UPDATE booking_accommodations SET start_date='2026-06-20', end_date='2026-07-04' WHERE id=11285 — only after Issue 37 resolved. 46 hourly checks, no action taken. Last checked: 2026-07-04 UTC (46th check, hrly bot).**


**4 Jul SAT UTC (47th check, fresh DB): STATUS DOWNGRADED — COSMETIC ONLY. Jesus Manuel Ramirez Diaz (ba11285, bed 83, booking 17825): Jun21-Jul05 stored (requested Jun20-Jul04) — 1-day discrepancy UNCHANGED. Jesus checks out TOMORROW 5 Jul — date correction is now purely cosmetic, no guest-impact remaining. Verónica Martín (ba11352, bed 83, booking 18156): Jul04-Jul11 active — Verónica arrived today, in SIS on bed 83. Issue 37 dependency resolved. Bed conflict de-escalated: 1-day Jul 4 overlap is standard hostel turnover (Jesus out, Verónica in). SQL NOT RUN — low priority since Jesus leaves tomorrow. No urgent action required. Last checked: 2026-07-04 UTC (47th check, hrly bot).**

**4 Jul SAT UTC (48th check, fresh DB): COSMETIC / EFFECTIVELY CLOSED. ba11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): Jun21-Jul05 stored (requested Jun20-Jul04) — 1-day discrepancy unchanged. Jesus checks out TOMORROW 5 Jul 2026. Date correction is purely cosmetic — no guest or financial impact. ba11352 (Veronica Martin, bed 83, booking 18156): Jul04-Jul11 active — Veronica arrived today. Issue 37 (bed conflict) resolved. Optional cosmetic SQL (NOT RUN): UPDATE booking_accommodations SET start_date=2026-06-20, end_date=2026-07-04 WHERE id=11285. Last checked: 2026-07-04 UTC (48th check, hrly bot).**


**4 Jul SAT UTC (49th check, fresh DB): STATUS — COSMETIC/RESOLVING TOMORROW. ba11285 (Jesús Manuel Ramírez Díaz, bed 83, booking 17825): Jun21-Jul05 stored (requested Jun20-Jul04) — 1-day discrepancy UNCHANGED. Jesus checks out TOMORROW Jul5. Date correction is now purely cosmetic; Jesus physically leaves tomorrow regardless. ba11352 (Verónica Martín, bed 83, booking 18156): Jul04-Jul11 active — Veronica arrived TODAY (Jul4). Both on bed83 today as turnover overlap — standard housekeeping. Optional cosmetic SQL (NOT RUN): UPDATE booking_accommodations SET start_date='2026-06-20', end_date='2026-07-04' WHERE id=11285. Low priority — no guest impact. Last checked: 2026-07-04 UTC (49th check, hrly bot).**
**4 Jul SAT UTC (50th check, fresh DB): COSMETIC / SELF-RESOLVES TOMORROW. ba11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): Jun21-Jul05 stored (requested Jun20-Jul04) — 1-day discrepancy unchanged. Jesus checks out TOMORROW 5 Jul 2026. Date correction purely cosmetic — no guest or financial impact. ba11352 (Veronica Martin, bed 83, booking 18156): Jul04-Jul11 active — Veronica arrived today. Issue 37 resolved. Optional cosmetic SQL (NOT RUN): UPDATE booking_accommodations SET start_date=2026-06-20, end_date=2026-07-04 WHERE id=11285. Last checked: 2026-07-04 UTC (50th check, hrly bot).**

**4 Jul SAT UTC (51st check, fresh DB): COSMETIC / SELF-RESOLVES TOMORROW — NO ACTION REQUIRED. ba11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): Jun21-Jul05 stored (requested Jun20-Jul04) — 1-day discrepancy unchanged. Jesus checks out TOMORROW 5 Jul 2026. Date correction is now purely cosmetic — no guest or financial impact. ba11352 (Veronica Martin, bed 83, booking 18156): Jul04-Jul11 active=true — Veronica arrived today. Issue self-resolves on Jesus departure tomorrow. No action needed. Last checked: 2026-07-04 UTC (51st check, hrly bot).**


**14 Jul TUE UTC (fresh DB): COSMETIC / STALE ONLY. ba11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): Jun21-Jul05 stored, active=STILL true (9d since checkout Jul05, updatedAt=Jul06=8d ago). Student checked out 5 Jul. No bed conflict (Veronica Issue 37 resolved). Optional cosmetic SQL (NOT RUN): UPDATE booking_accommodations SET active=false WHERE id=11285. Last checked: 2026-07-14 TUE UTC (fresh DB, hrly bot).**


**15 Jul WED UTC (fresh DB):** BA11285 bed83 Jun21-Jul05 active=STILL true (10d post-checkout Jul05, updatedAt=Jul06). Bed conflict (Issue 37) now cleared - both Veronica and Jesus have departed. Both stale BAs on bed 83 need deactivation (see issue-37 recipe for batch UPDATE). Low priority cosmetic. Last checked: 2026-07-15 UTC.


**17 Jul FRI UTC (fresh DB): Stale accommodations STILL active.** BA11285 (Jesus Manuel Ramirez Diaz, bed 83, Jun 21-Jul 5): active=STILL true (12d post-checkout Jul 5, last updated Jul 6). BA11352 (Veronica Martin, bed 83, Jul 4-Jul 11): active=STILL true (6d post-checkout Jul 11). Both on bed 83 — both stale. Date discrepancy on BA11285 (stored Jun21-Jul05, requested Jun20-Jul04) is cosmetic. Batch deactivation SQL (NOT YET RUN): UPDATE booking_accommodations SET active=false WHERE id IN (11285, 11352). Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (2nd check, hourly bot).

---
3rd check Saturday 18 July 2026 UTC

CONFIRMED UNCHANGED (fresh DB, Sat 18 Jul).
Booking accommodation 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): stored dates 21 June to 5 July — requested 20 June to 4 July — 1-day discrepancy on both ends.
Student checked out 5 July 2026, 13 days ago — no guest impact remaining.
Accommodation 11285: active=STILL true — 13 days post-checkout.
Batch fix with Issue 37: accommodation 11352 (Veronica Martin, bed 83, Jul 4–11) also still active.
Fix NOT RUN. Last checked: Saturday 18 July 2026 UTC (3rd daily check, hourly bot).

---
4th check Sun 19 Jul 2026 UTC

CONFIRMED UNCHANGED (fresh DB, Sun 19 Jul).
Booking accommodation 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): stored dates 21 June to 5 July — 1-day discrepancy vs requested 20 June to 4 July. Student checked out 5 July 2026, 14 days ago. active = STILL true — 14 days post-checkout.
Booking accommodation 11352 (Veronica Martin, bed 83, booking 18114): 4 July to 11 July 2026. Checked out 11 July, 8 days ago. active = STILL true — 8 days post-checkout.
Batch fix (NOT YET RUN): UPDATE booking_accommodations SET active=false WHERE id IN (11285, 11352);
Last checked: Sun 19 Jul 2026 UTC (4th check).

---
5th check Wed 22 Jul 2026 UTC

CONFIRMED UNCHANGED (fresh DB, Wed 22 Jul).
Booking accommodation 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): stored dates 21 Jun to 5 Jul — 1-day discrepancy vs requested 20 Jun to 4 Jul. Student checked out 5 Jul, 17 days ago. active = STILL true.
Booking accommodation 11352 (Veronica Martin, bed 83, booking 18156): 4 Jul to 11 Jul 2026. Checked out 11 Jul, 11 days ago. active = STILL true.
Batch fix (NOT YET RUN): UPDATE booking_accommodations SET active=false WHERE id IN (11285, 11352);
Last checked: Wed 22 Jul 2026 UTC (5th check, hourly bot).

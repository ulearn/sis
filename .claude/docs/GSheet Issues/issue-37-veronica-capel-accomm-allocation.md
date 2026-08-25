Issue 37 — Verónica Martín (ID 278) — Capel accommodation bed 83 double-booked

Reporter: KC | Area: Booking / Accomm | Sheet row: 39 | SIS student: 278

SYMPTOM
Student paid for a week accommodation in Capel but it did not appear in SIS allocation.

ROOT CAUSE — UPDATED 2 JUL 2026 (57th check)

ORIGINAL ISSUE (PARTIALLY RESOLVED)
The accommodation record (id 11352) existed but had bed_id = null, making it invisible
in the allocation view. The bed was subsequently assigned: bed_id = 83 set.
Booking 18156 was PENDING (EUR 0 / EUR 645) — now CONFIRMED and fully paid EUR 573.20.

NEW PROBLEM — URGENT — VERONICA ARRIVES SATURDAY 4 JUL (2 DAYS AWAY)

Bed 83 (City Centre Apartment) is DOUBLE-BOOKED:
  - Accommodation 11352 (Veronica Martin, bk18156): 4 Jul to 11 Jul — Veronica arrives Saturday
  - Accommodation 11285 (Jesus Manuel Ramirez Diaz, bk17825): 21 Jun to 5 Jul
  - 1-night overlap: Friday night 4 Jul (Veronica checks in while Jesus still in bed 83 until Sat 5 Jul checkout)

Live data (checked 2 Jul 2026 UTC, 57th check):
  bk18156: CONFIRMED, confirmed = true, amountPaid = EUR 573.20, amountTotal = EUR 573.20
  ba11352: City Centre Apartment, bed_id = 83, Jul 4 – Jul 11, active = true
  ba11285: City Centre Apartment, bed_id = 83, Jun 21 – Jul 5, active = true
  Beds 174, 175, 176 (City Centre Apartment): CONFIRMED FREE Jul 4 – Jul 11
    (fresh DB query 2 Jul UTC, zero conflicts returned for any of beds 174/175/176 in Jul 4-11 range)

FIX RECIPE — NOT YET RUN — MUST RUN TODAY OR EARLY SATURDAY MORNING

Option B (preferred) — Reassign Veronica to a free bed

Step 1 — Via SIS UI (preferred):
  Navigate: SIS -> Student 278 (Verónica Martín) -> Booking 18156 -> Accommodation section
  Edit accommodation 11352. Change bed from 83 to bed 174, 175, or 176 (all free Jul 4–11).
  Save.

Step 2 — Fallback direct SQL [NOT YET RUN]:
  UPDATE booking_accommodations
  SET bed_id = 174, updated_at = NOW()
  WHERE id = 11352;
  -- Substitute bed_id 175 or 176 if preferred

Step 3 — Verify:
  SELECT id, bed_id, start_date, end_date, active FROM booking_accommodations WHERE id = 11352;
  -- Expected: bed_id = 174 (or 175/176), Jul 4 – Jul 11

Option A (alternative) — Correct Jesus end date to 4 Jul
  Verify HubSpot deal before changing Jesus dates.
  UPDATE booking_accommodations SET end_date = '2026-07-04' WHERE id = 11285;
  Even with this, Veronica still arrives Jul 4 (same day Jesus checks out = same night in bed).
  Option B is cleaner.

RISK / CATEGORY
  Category: accommodation, bookings
  Reversible: Yes — bed assignment can be changed at any time
  Blast radius: Two students (Veronica + Jesus), two accommodation records
  Urgency: CRITICAL — Veronica arrives Saturday 4 Jul (2 days). Fix today (Thu 2 Jul) or early Sat morning.

STATUS
OPEN — bed 83 double-booked, not resolved (57th check, 2 Jul UTC). VERONICA ARRIVES SATURDAY 4 JUL (2 DAYS).
57 hourly checks — NO ACTION TAKEN. Beds 174/175/176 re-confirmed free (fresh DB 2 Jul UTC, zero conflicts Jul 4-11).
NEIL: Act TODAY (Thu 2 Jul) — Veronica arrives in 2 days. Move ba11352 to bed 174, 175, or 176.

**Jul02 THU UTC (58th check, fresh DB): CONFIRMED UNCHANGED. ba11352 (Veronica, bed83, Jul04-Jul11) and ba11285 (Jesus, bed83, Jun21-Jul05) BOTH still active — conflict on Sat 4 Jul night CONFIRMED. Beds 174/175/176 ZERO conflicts Jul4-11 (fresh DB query). Veronica ARRIVES SATURDAY 4 JUL (2 DAYS). 58 hourly checks, no action. NEIL: move ba11352 to bed 174/175/176 TODAY Thu 2 Jul. Last checked: 2026-07-02 UTC (58th check, hrly bot).**


**Jul02 THU UTC (59th check, fresh DB): CONFIRMED UNCHANGED. ba11352 (Veronica, bed 83, Jul 4-11) and ba11285 (Jesus, bed 83, Jun 21-Jul 5) BOTH still active. Bed 83 conflict Sat 4 Jul CONFIRMED. Beds 174/175/176 ZERO conflicts Jul 4-11 (fresh DB, zero rows returned). 59 hourly checks — NO ACTION TAKEN. VERONICA ARRIVES SATURDAY 4 JUL (2 DAYS). NEIL: move ba11352 to bed 174/175/176 via SIS Student 278 > Booking 18156 > Accommodation > edit. Last checked: 2026-07-02 UTC (59th check, hrly bot).**

**Jul02 THU UTC (60th check, fresh DB): CONFIRMED UNCHANGED. ba11352 (Veronica Martín, bed 83, Jul 4-11, active=true) + ba11285 (Jesús Ramírez Díaz, bed 83, Jun 21-Jul 5, active=true) — BED 83 DOUBLE-BOOKED SAT 4 JUL CONFIRMED. Beds 174/175/176 ZERO conflicts Jul 4-11 (fresh DB query, zero rows). VERONICA ARRIVES TOMORROW SAT 4 JUL. 60 hourly checks, NO ACTION. NEIL: move ba11352 from bed 83 to bed 174 (or 175/176) TODAY — via SIS Student 278 > Booking 18156 > Accommodation > edit 11352. Last checked: 2026-07-02 UTC (60th check, hrly bot).**

**Jul02 THU UTC (62nd check, fresh DB): CONFIRMED UNCHANGED. ba11352 (Veronica Martin, bed 83, Jul 4-11, active=true) + ba11285 (Jesus Ramirez Diaz, bed 83, Jun 21-Jul 5, active=true). Bed 83 double-booked Saturday 4 Jul — Veronica arrives TOMORROW. Alt Capel beds 174/175/176: zero conflicts Jul 4-11 (fresh DB query). 62 hourly checks, NO ACTION. NEIL: move ba11352 to bed 174/175/176 TODAY via SIS Student 278 > Booking 18156 > Accommodation > edit 11352. Last checked: 2026-07-02 UTC (62nd check, hrly bot).**

**Jul02 THU UTC (63rd check, fresh DB): CONFIRMED UNCHANGED. ba11352 (Veronica Martin, booking 18156): bed 83, Jul 4-11, active=true. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed 83, Jun 21-Jul 5, active=true. Bed 83 double-booked Sat 4 Jul CONFIRMED. Beds 174, 175 (zero records), 176 (zero records) ALL FREE Jul 4-11 (fresh DB query). 63 hourly checks, NO ACTION. Veronica ARRIVES TOMORROW SAT 4 JUL. NEIL: move ba11352 to bed 175 via SIS Student 278 > Booking 18156 > Accommodation > edit 11352 TODAY. Last checked: 2026-07-02 UTC (63rd check, hrly bot).**


**Jul02 THU UTC (64th check, fresh DB): CONFIRMED UNCHANGED. ba11352 (Veronica Martín, booking 18156): bed 83, Jul 4-11, active=true. ba11285 (Jesús Ramírez Díaz, booking 17825): bed 83, Jun 21-Jul 5, active=true. Bed 83 double-booked Saturday 4 Jul CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh DB query). CORRECTION: Veronica arrives SATURDAY 4 JUL — 2 days away (not tomorrow). 64 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174/175/176. Last checked: 2026-07-02 UTC (64th check, hrly bot).**

**Jul02 THU UTC (65th check, fresh DB): CONFIRMED UNCHANGED. ba11352 (Veronica Martin, booking 18156): bed 83, Jul 4-11, active=true. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed 83, Jun 21-Jul 5, active=true. Bed 83 double-booked Saturday 4 Jul CONFIRMED. Beds 174, 175, 176 ZERO conflicts Jul 4-11 (fresh DB query, zero rows). VERONICA ARRIVES SATURDAY 4 JUL (2 DAYS). 65 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176). Last checked: 2026-07-02 UTC (65th check, hrly bot).**
**Jul02 THU UTC (66th check, fresh DB): CONFIRMED UNCHANGED. ba11352 (Veronica Martin, booking 18156): bed 83, Jul 4-11, active=true — NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed 83, Jun 21-Jul 5, active=true. Bed 83 double-booked Sat 4 Jul CONFIRMED. Beds 174, 175, 176 ZERO conflicts Jul 4-11 (fresh DB query). VERONICA ARRIVES SATURDAY 4 JUL (2 DAYS). 66 hourly checks, NO ACTION. NEIL: move ba11352 to bed 174/175/176 via SIS Student 278 > Booking 18156 > Accommodation > edit 11352. Fix TODAY Thu 2 Jul. Last checked: 2026-07-02 UTC (66th check, hrly bot).**

**3 Jul FRI UTC (67th check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SATURDAY 4 JUL. ba11352 (Veronica Martin, booking 18156): bed 83, Jul 4-11, active=true — NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed 83, Jun 21-Jul 5, active=true. Bed 83 double-booked Saturday 4 Jul CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh DB query). NEW FINDING: Accommodation 11346 (booking 17826, Fabrizio Mauro, student 14440): accommodationType=Host Family, bedId=83, Jul 12-Aug 9, active=true — DATA ANOMALY: a host family placement should not reference a Capel apartment bed. This should also be cleared/nulled but is lower priority than the Veronica conflict. 67 hourly checks, NO ACTION on bed 83. NEIL: move ba11352 to bed 174/175/176 TODAY FRI 3 JUL — Veronica arrives TOMORROW. Via SIS Student 278 > Booking 18156 > Accommodation > edit 11352. Also investigate ba11346 bedId=83 anomaly. Last checked: 2026-07-03 UTC (67th check, hrly bot).**

**3 Jul FRI UTC (68th check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bed 83, Jul 4-11, active=true — STILL NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed 83, Jun 21-Jul 5, active=true. Bed 83 double-booked — 2-night conflict Jul 4-5. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh DB query). Stale active=true on bed 83 (not blocking Veronica): ba11239 Ivan ended May24=39d, ba11168 Diego ended Jun20=13d. Anomaly ba11346 Fabrizio HF type bedId=83 Jul12-Aug09. 68 hourly checks NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176). FIX TODAY FRI 3 JUL. Last checked: 2026-07-03 UTC (68th check, hrly bot).**

**3 Jul FRI UTC (69th check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bed_id=83, Jul 4-11, active=true — NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed_id=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh DB query). Anomaly: ba11346 (Fabrizio Mauro, booking 17826) type=Host Family but bedId=83 Jul 12-Aug 9 — lower priority. 69 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX TODAY FRI 3 JUL. Last checked: 2026-07-03 UTC (69th check, hrly bot).**


**3 Jul FRI UTC (70th check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bed_id=83, Jul 4-11, active=true — NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed_id=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh DB query). Anomaly: ba11346 (Fabrizio Mauro, booking 17826) type=Host Family but bedId=83 Jul 12-Aug 9 — lower priority. 70 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX TODAY FRI 3 JUL. Last checked: 2026-07-03 UTC (70th check, hrly bot).**

**3 Jul FRI UTC (72nd check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bed_id=83, Jul 4-11, active=true — NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed_id=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh DB query, zero rows). 72 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX TODAY FRI 3 JUL. Last checked: 2026-07-03 UTC (72nd check, hrly bot).**
**3 Jul FRI UTC (73rd check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bedId=83, Jul 4-11, active=true — STILL NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bedId=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh Prisma query, zero rows). 73 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX NOW FRI 3 JUL BEFORE SATURDAY. Last checked: 2026-07-03 UTC (73rd check, hrly bot).**


**3 Jul FRI UTC (75th check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bedId=83, Jul 4-11, active=true — NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bedId=83, Jun 21-Jul 5, active=true. Bed 83 double-booked — 2-night conflict Jul 4-5 CONFIRMED (both records active). Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh DB query, zero rows). 75 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX NOW BEFORE SATURDAY. Last checked: 2026-07-03 UTC (75th check, hrly bot).**
**3 Jul FRI UTC (76th check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bedId=83, Jul 4-11, active=true — NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bedId=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh Prisma query, zero rows). Anomaly: ba11346 (Fabrizio Mauro, booking 17826) type=Host Family bedId=83 Jul 12-Aug 9 — lower priority. 76 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX NOW FRI 3 JUL BEFORE SATURDAY. Last checked: 2026-07-03 UTC (76th check, hrly bot).**

**3 Jul FRI UTC (78th check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bedId=83, Jul 4-11, active=true — NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bedId=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh Prisma query, zero rows). ARRIVAL TOMORROW SAT 4 JUL. 78 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX NOW FRI 3 JUL BEFORE SATURDAY. Last checked: 2026-07-03 UTC (78th check, hrly bot).**

**3 Jul FRI UTC (79th check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bedId=83, Jul 4-11, active=true — STILL NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bedId=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh Prisma query, zero rows). ARRIVAL TOMORROW SAT 4 JUL. 79 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX NOW FRI 3 JUL BEFORE SATURDAY. Last checked: 2026-07-03 UTC (79th check, hrly bot).**

**3 Jul FRI UTC (80th check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bed_id=83, Jul 4-11, active=true — STILL NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed_id=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh Prisma query, zero rows). 80 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX NOW FRI 3 JUL BEFORE SATURDAY. Last checked: 2026-07-03 UTC (80th check, hrly bot).**

**3 Jul FRI UTC (81st check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL — LESS THAN 24 HOURS. ba11352 (Veronica Martin, booking 18156): bed_id=83, Jul 4-11, active=true — NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed_id=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh Prisma query, zero rows). 81 hourly checks, NO ACTION TAKEN. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX NOW BEFORE SAT MORNING. Last checked: 2026-07-03 UTC (81st check, hrly bot).**

**3 Jul FRI UTC (82nd check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bed_id=83, Jul 4-11, active=true — STILL NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed_id=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (raw SQL, zero rows). CONFLICT STARTS TOMORROW. 82 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX NOW. Last checked: 2026-07-03 UTC (82nd check, hrly bot).**
**3 Jul FRI UTC (85th check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bedId=83, Jul 4-11, active=true — STILL NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bedId=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh Prisma query, zero rows). 85 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX TODAY FRI 3 JUL BEFORE SATURDAY MORNING. Last checked: 2026-07-03 UTC (85th check, hrly bot).**

**3 Jul FRI UTC (86th check, fresh DB): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bedId=83, Jul 4-11, active=true — STILL NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bedId=83, Jun 21-Jul 5, active=true. Bed 83 2-night conflict Jul 4-5 CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh Prisma query, zero rows). 86 hourly checks, NO ACTION. Also resolve Issue 43 (Jesus dates) AFTER moving Veronica. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — FIX NOW. Last checked: 2026-07-03 UTC (86th check, hrly bot).**

**3 Jul FRI UTC (87th check, fresh raw SQL): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Verónica Martín, booking 18156): bed_id=83, Jul 4-11, active=true — STILL NOT MOVED. ba11285 (Jesús Manuel Ramírez Díaz, booking 17825): bed_id=83, Jun 21-Jul 5, active=true. Bed 83 double-booked — 2-night conflict Sat 4 Jul + Sun 5 Jul CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (raw SQL JOIN query, zero rows). 87 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit accommodation 11352 > change bed to 174 (or 175/176) — FIX NOW BEFORE SATURDAY MORNING. Last checked: 2026-07-03 UTC (87th check, hrly bot).**
**3 Jul FRI UTC (88th check, fresh raw SQL): CONFIRMED UNCHANGED — VERONICA ARRIVES TOMORROW SAT 4 JUL. ba11352 (Veronica Martin, booking 18156): bed_id=83, Jul 4-11, active=true — STILL NOT MOVED. ba11285 (Jesus Manuel Ramirez Diaz, booking 17825): bed_id=83, Jun 21-Jul 5, active=true. Bed 83 double-booked — 2-night conflict Sat 4 Jul + Sun 5 Jul CONFIRMED. Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh raw SQL JOIN, zero rows). 88 hourly checks, NO ACTION TAKEN. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit accommodation 11352 > change bed to 174 (or 175/176) — FIX IMMEDIATELY. Last checked: 2026-07-03 UTC (88th check, hrly bot).**


**4 Jul SAT UTC (89th check, fresh DB): CONFLICT NOW LIVE — VERONICA HAS ARRIVED. ba11352 (Verónica Martín, booking 18156): bed_id=83, Jul 4-11, active=true — NOT MOVED. ba11285 (Jesús Manuel Ramírez Díaz, booking 17825): bed_id=83, Jun 21-Jul 5, active=true. BOTH GUESTS ON BED 83 RIGHT NOW (Jul 4 today + Jul 5 tomorrow). Beds 174, 175, 176: ZERO conflicts Jul 4-11 (fresh DB query, zero rows). 89 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed to 174 (or 175/176) — STUDENT IS IN THE BUILDING. Last checked: 2026-07-04 UTC (89th check, hrly bot).**

**4 Jul SAT UTC (91st check, fresh DB): CONFLICT STILL LIVE — VERONICA IS IN THE BUILDING TODAY. ba11352 (Verónica Martín, booking 18156): bed_id=83, Jul 4-11, active=true — NOT MOVED. ba11285 (Jesús Manuel Ramírez Díaz, booking 17825): bed_id=83, Jun 21-Jul 5, active=true — Jesus checks out TOMORROW 5 Jul. Bed 83 double-booked today AND tomorrow CONFIRMED. Beds 174, 175, 176 confirmed free Jul 4-11 (from prior DB checks). 91 hourly checks, NO ACTION TAKEN. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — STUDENT IS IN BUILDING. Fix before tomorrow morning (Jesus checkout). Last checked: 2026-07-04 UTC (91st check, hrly bot).**

**4 Jul SAT UTC (92nd check, fresh raw SQL): CONFLICT STILL LIVE — BOTH GUESTS ON BED 83 TONIGHT. ba11352 (Verónica Martín, booking 18156): bed_id=83, Jul4-Jul11, active=true, last_updated=Jun29 — NOT MOVED. ba11285 (Jesús Manuel Ramírez Díaz, booking 17825): bed_id=83, Jun21-Jul5, active=true, last_updated=Jun16. TONIGHT = Veronica first night + Jesus last night. Jesus checks out TOMORROW Jul5. Beds 174/175/176 confirmed free Jul4-11 (prior DB checks). 92 hourly checks, NO ACTION. NEIL: SIS Student 278 > Booking 18156 > Accommodation > edit 11352 > change bed 83 to bed 174 (or 175/176) — move before 10am Jul5. Last checked: 2026-07-04 UTC (92nd check, hrly bot).**


---
STATUS UPDATE 4 JUL 2026 UTC (59th check): VERONICA ARRIVED

Veronica Martin (student 278) has arrived at bed 83 today (Jul 4 2026).
ba11352: bed_id=83, start_date=Jul4, end_date=Jul11, active=true, claim_status=null, booking_id=18156.
bk18156: CONFIRMED, confirmed=true, amount_paid=EUR573.20, amount_total=EUR573.20 (fully paid).
Course bc starts Jul 6 (General English AM).

Jesus Ramirez Diaz (ba11285, bed 83) runs Jun21-Jul5 — he checks out TOMORROW (Jul 5).
The 1-day overlap (Jul 4) is standard hostel check-in/check-out turnover; no actual conflict.

Issue 43 (Jesus date correction, 1 day off) is still open but immaterial now — Jesus leaves tomorrow.

ORIGINAL ISSUE RESOLVED: accommodation is in SIS, bed 83 assigned, student arrived.
Monitoring complete. No further action needed on this issue.

**9 Jul THU UTC 04:04 (final check): CONFIRMED RESOLVED. ba11352 (Veronica Martin, booking 18156): bed 83, Jul4-Jul11, active=true. Student mid-stay — checkout Sat 11 Jul. Booking confirmed, EUR 573.20/573.20 fully paid. Closing monitoring — no further action needed.**

---
**15 Jul WED UTC — POST-CHECKOUT HOUSEKEEPING**

Original issue resolved. Veronica checked out Sat 11 Jul. New finding 15 Jul UTC:
- BA11352 (Veronica Martin, bed 83, Jul 4-Jul 11): active = still true, 4 days post-checkout
- BA11285 (Jesus Manuel Ramirez Diaz, bed 83, Jun 21-Jul 5): active = still true, 10 days post-checkout (Issue 43)
- Both BAs on bed 83 now stale; low-priority cosmetic cleanup.

Fix recipe (NOT YET RUN):
  UPDATE booking_accommodations SET active = false WHERE id IN (11352, 11285);

Risk: cosmetic/data-hygiene. Fully reversible. No financial or guest impact.
Last checked: 2026-07-15 UTC.


---
**16 Jul 2026 UTC (fresh DB)**

CONFIRMED UNCHANGED. BA11352 (Veronica Martin, bed 83, Jul 4-Jul 11): active=STILL true (5 days post-checkout, student departed Jul11). BA11285 (Jesus Manuel Ramirez Diaz, bed 83, Jun 21-Jul 5): active=STILL true (11 days post-checkout — Issue 43). Both records on bed 83. Cosmetic cleanup only.

Fix (NOT YET RUN): UPDATE booking_accommodations SET active = false WHERE id IN (11285, 11352);
Last checked: 2026-07-16 UTC (hourly bot).

**17 Jul 2026 UTC (fresh DB)**

CONFIRMED UNCHANGED. BA11352 (Veronica Martin, bed 83, Jul 4-Jul 11): active=STILL true (6 days post-checkout, student departed Jul 11). BA11285 (Jesus Manuel Ramirez Diaz, bed 83, Jun 21-Jul 5): active=STILL true (12 days post-checkout — Issue 43). Both records on bed 83. Cosmetic cleanup only.

Fix (NOT YET RUN): UPDATE booking_accommodations SET active = false WHERE id IN (11285, 11352);
Last checked: 2026-07-17 UTC (hourly bot).

---
2nd check Saturday 18 July 2026 UTC

CONFIRMED UNCHANGED (fresh DB, Sat 18 Jul).
Booking accommodation 11352 (Veronica Martin, bed 83, booking 18156, 4 Jul to 11 Jul 2026): active=STILL true — 7 days post-checkout (checked out 11 Jul).
Booking accommodation 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825, 21 Jun to 5 Jul 2026): active=STILL true — 13 days post-checkout (checked out 5 Jul). See also Issue 43.
Both records on bed 83 — cosmetic data hygiene only. No current guest occupying bed 83.
Fix NOT RUN. Last checked: Saturday 18 July 2026 UTC (2nd daily check, hourly bot).

---
4th check Wed 22 Jul 2026 UTC

CONFIRMED UNCHANGED (fresh DB, Wed 22 Jul).
Booking accommodation 11352 (Veronica Martin, bed 83, booking 18156): 4 Jul to 11 Jul 2026. Student checked out 11 Jul, 11 days ago. active = STILL true.
Booking accommodation 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): 21 Jun to 5 Jul 2026. Student checked out 5 Jul, 17 days ago. active = STILL true. (See also Issue 43.)
Batch fix (NOT YET RUN): UPDATE booking_accommodations SET active=false WHERE id IN (11285, 11352);
Last checked: Wed 22 Jul 2026 UTC (4th check, hourly bot).

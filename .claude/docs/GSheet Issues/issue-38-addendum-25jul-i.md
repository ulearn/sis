# Issue 38 Aug Bank Holiday — Addendum 99th hrly Sat 25 Jul 2026

Reporter: PG | Area: Holidays/Bookings | Sheet row 40

STATUS
Unchanged count from 98th hourly. Aug 3 Bank Holiday = 9 calendar days away. No school_closure entry exists for Aug 3.
Total: 17 booking courses start Aug 3 — 12 non-AY (11 to shunt + 1 dup to delete) + 5 AY auto-handled by webhook.

LIVE CHECK (99th hrly)
BC 25016 (Anderson da Silva Martins): end_date STILL 2028-08-29 — typo NOT corrected.
Aug 3 active booking courses: 17 — unchanged from 98th hourly.
List unchanged: BC 88, 97, 1755, 1766, 24627, 24908, 24956, 24964, 24970, 24984, 24999, 25002, 25003, 25010, 25016.

SHUNT SQL (NOT YET RUN — carried from 98th hourly)

  -- Step 1: Fix end_date typo on BC 25016
  UPDATE booking_courses SET end_date = '2026-08-29' WHERE id = 25016;

  -- Step 2: Deactivate Aleix dup
  UPDATE booking_courses SET active = false WHERE id = 25003;

  -- Step 3: Shunt 11 non-AY BCs from Aug 3 to Aug 4
  UPDATE booking_courses SET start_date = '2026-08-04'
  WHERE id IN (88, 1755, 24627, 24908, 24956, 24964, 24984, 24999, 25002, 25010, 25016);

  -- Step 4: Verify
  SELECT id, name, start_date, end_date, active FROM booking_courses
  WHERE id IN (88, 1755, 24627, 24908, 24956, 24964, 24984, 24999, 25002, 25003, 25010, 25016) ORDER BY id;

  -- Note: 5 AY BCs (97, 1766, 24958, 24959, 24970) handled by AY webhook on confirmation.
  -- BC 97 (PENDING booking 89) may need manual shunt — confirm first.

RISK
Category: bookings. Reversible: yes. Blast radius: 11 students + 1 dup deactivation + 1 end_date fix.
BC 25016 end_date fix must precede the shunt.

STATUS: Fix NOT RUN. Aug 3 = 9 calendar days away.
Last checked: Sat 25 Jul 2026 UTC (99th hourly)

Issue 38 -- Aug and Oct Bank Holiday Missing from school_closures -- Addendum 24 Jul (g)

Reporter: PG | Area: Holidays / Bookings | Sheet row: 40
Checked: Fri 24 Jul 2026 UTC -- 86th hourly check, 159th total run

ROOT CAUSE (confirmed, unchanged)
school_closures has only Good Fridays (2026-2030) and Christmas breaks (2026-2029). No Bank Holidays.

CURRENT STATUS -- UNCHANGED, 10 DAYS TO AUG BH
- Aug Bank Holiday Mon 3 Aug 2026: ABSENT from school_closures -- 10 calendar days away
- Oct Bank Holiday Mon 26 Oct 2026: ABSENT from school_closures
- Active booking courses spanning Aug 3: 203
- Courses starting Mon 3 Aug: 17
  (BC 88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25003, 25010, 25016)
- Issue 22 (Edite Nunes BC 24991 ends Aug 7) depends on this closure being added first

FIX RECIPE (NOT YET RUN)

Step 1: INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2: INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('October Bank Holiday', '2026-10-26', '2026-10-26', true, NOW());

Step 3 -- Review 17 courses starting Mon 3 Aug:
  SELECT id, name, start_date, booking_id FROM booking_courses WHERE start_date = '2026-08-03' AND active = true;
  For short-course students starting Aug 3, shift start to Tue 4 Aug and adjust end date.

Step 4 -- Confirm:
  SELECT id, name, start_date, end_date, is_paid_holiday FROM school_closures ORDER BY start_date;

RISK: bookings/holidays | Reversible: Yes | Blast radius: HIGH -- 203 active courses span Aug 3
STATUS: CRITICAL -- Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC
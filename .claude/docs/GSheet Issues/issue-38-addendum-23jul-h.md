# Issue 38 --- Aug + Oct Bank Holidays Missing from School Closures
Reporter: PG | Area: Holidays, Bookings etc. | Sheet Row 40

## Symptom
Aug BH (Mon 3 Aug 2026) and Oct BH (Mon 27 Oct 2026) absent from school_closures.

## Root Cause (72nd hourly check, Thu 23 Jul 2026 UTC --- 145th total)
school_closures H2 2026: only Christmas break (21 Dec 2026 - 3 Jan 2027, id=7).
- August Bank Holiday Mon 3 Aug 2026: ABSENT --- 11 calendar days away --- CRITICAL
- October Bank Holiday Mon 27 Oct 2026: ABSENT

## Fix Recipe (NOT YET RUN)

Step 1 - Insert August Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true);
  -- NOT YET RUN

Step 2 - Insert October Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('October Bank Holiday', '2026-10-27', '2026-10-27', true);
  -- NOT YET RUN

Step 3 - Check courses ending on Aug 3 (shunt to Aug 4 if any):
  SELECT id, booking_id, name, end_date FROM booking_courses
  WHERE end_date = '2026-08-03' AND active = true;
  -- Then shunt end_date to 2026-08-04 for any found

## Risk
- bookings (course end shunting), data-hygiene; reversible (DELETE inserts if wrong)
- Blast radius: all booking courses ending on Aug 3 or Oct 27

## Status
CRITICAL --- August Bank Holiday is 11 days away. Fix NOT RUN.
Last checked: Thu 23 Jul 2026 UTC (72nd hourly, 145th total)
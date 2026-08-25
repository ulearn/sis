# Issue 23 -- Enshi Lu Backwards Course Dates (30 Jul 2026)
Reporter: pg | Area: Booking / Class / Holiday | Sheet row: 24
Last checked: 2026-07-30 UTC -- hash change: B field updated with deal/student IDs

## Symptom
Course dates do not make sense -- start March, finish February.

## Root cause (live DB, 2026-07-30)
Booking 787 (Enshi Lu, student 397): CONFIRMED, confirmed=true, fully paid EUR 2,147.50.
Four booking courses on booking 787, all active=true, all fees=null:
- BC 826: Academic Year Morning, 17 Nov 2025 to 28 Nov 2025 -- 244 days stale, active=true
- BC 827: Academic Year Morning, 5 Jan 2026 to 30 Jan 2026 -- 181 days stale, active=true
- BC 828: Academic Year Morning, start 2 Mar 2026, end 27 Feb 2026 -- BACKWARDS (end 3 days before start; DST migration bug), active=true
- BC 829: Academic Year Morning, 30 Mar 2026 to 5 Jun 2026 -- 55 days stale, active=true
All four have ilepCode 0318/0020. All fees = null (low-priority).
Student has left; no active class assignments expected.

## Fix recipe (NOT YET RUN)
Step 1 -- Correct BC 828 end date (verify correct date with Neil before running;
  the start is 2 Mar 2026 so end should likely be around Jun 2026 based on AY pattern):
  UPDATE booking_course SET end_date = DATE(2026-06-19), updated_at = NOW() WHERE id = 828;
  Note: 2026-06-19 is approximate -- confirm against the student record or ILEP data.

Step 2 -- Deactivate all 4 stale booking courses:
  UPDATE booking_course SET active = false, updated_at = NOW() WHERE id IN (826, 827, 828, 829);
  -- Expect 4 rows affected

Verify:
  SELECT id, start_date, end_date, active FROM booking_course WHERE id IN (826, 827, 828, 829);
  -- Expect active=false on all four; BC 828 end_date should be after start_date

## Risk
Category: data-hygiene. Reversible. Blast radius: booking 787 only. Low priority -- student has left.

## Status
NOT YET RUN. Last checked: 2026-07-30 UTC.
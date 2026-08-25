# Issue 10 -- Massimiliano Cameran cert missing, confirmed=false (54th check)

Reporter: NM | Area: Doc Gen/Certs | Sheet row: 11 | Last checked: 2026-08-17 UTC

## Symptom
Certificate shows only last two weeks of course; dates cannot be corrected manually.

## Root cause (no change)
- Booking 97 (Massimiliano Cameran, student 1): CONFIRMED, confirmed = false (anomaly)
  -- fully paid EUR 1,741, amountOpen = 0
- Booking Course 107 (Morning General): ended 2026-05-22 -- 87 days stale, active = true, 1 class assignment (historical)
- Booking Course 24793 (General English AM): ended 2026-06-05 -- 73 days stale, active = true, 1 class assignment (historical)
- No completion certificate on Booking 97 -- only doc 64 (Net-to-Gross Invoice, ISSUED)

## Fix recipe (NOT YET RUN)
1. Verify BC 107 class assignment is historical (within course period):
   SELECT id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 107;
2. Verify BC 24793 class assignment is historical:
   SELECT id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 24793;
3. Deactivate BC 107 + 24793 if historical:
   UPDATE booking_courses SET active = false WHERE id IN (107, 24793);
4. Set Booking 97 confirmed = true:
   UPDATE bookings SET confirmed = true WHERE id = 97;
5. Generate completion certificate via SIS admin for student 1 (Massimiliano Cameran).

## Risk
Documents: medium (cert generation). Booking confirmed flag: low. Reversible.

## Status
87 days stale (BC 107). No change. Fix pending Neil approval.
Last checked: 2026-08-17 UTC (54th check)
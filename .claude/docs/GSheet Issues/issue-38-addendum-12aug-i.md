# Issue 38 - Eduardo Roche Diaz - BC25043 (134th check 12 Aug 2026)

Reporter: PG  Area: Booking/Class  Sheet row: 40

## Symptom
BC 25043 (General English PM, 10-14 Aug 2026) has 0 class assignments. Course ends Friday 14 Aug 2026.

## Root Cause (unchanged)
BC 25043: student_id=14602, booking_id=18265, class_id=6 -- SCA never inserted.
Pattern: BC 25038 had SCA 421 for Aug 3-7. BC 25043 created without SCA.

## Days Lost (134th check, Wed 12 Aug)
- Mon 10 Aug: unrecorded
- Tue 11 Aug: unrecorded
- Wed 12 Aug: unrecorded (today)
- Thu 13 Aug: still recoverable
- Fri 14 Aug: still recoverable (course end)
3 of 5 school days lost. 2 remain.

## Fix Recipe - NOT YET RUN

INSERT class assignment:
  booking_course_id=25043, student_id=14602, class_id=6
  week_start=2026-08-10, week_end=2026-08-14
Then mark Thu+Fri attendance on Class 6 via SIS UI.

## Risk
Category: bookings/attendance. Reversible. Blast radius: 1 student, 1 week.
URGENCY: CRITICAL - ends Fri 14 Aug 2026. 2 school days remain.

## Status
Fix NOT RUN. Unchanged 134 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC (134th check, run 221)
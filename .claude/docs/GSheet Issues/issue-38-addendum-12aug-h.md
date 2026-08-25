# Issue 38 - Eduardo Roche Diaz - BC25043 (133rd check 12 Aug 2026)

Reporter: PG  Area: Booking/Class  Sheet row: 40

## Symptom
BC 25043 (General English PM, 10-14 Aug 2026) has 0 class assignments. Eduardo attended Class 6 for prior 3 weeks; final week SCA never inserted. Course ends Friday 14 Aug 2026.

## Root Cause
Weekly BCs created automatically but SCAs inserted separately. Pattern confirmed:
- BC 25011 to SCA 358, class 6, week Jul 20-24
- BC 25023 to SCA 359, class 6, week Jul 27-31
- BC 25038 to SCA 421, class 6, week Aug 3-7 (verified this run)

BC 25043 (Aug 10-14): created but SCA never inserted.
student_id=14602, booking_id=18265, class_id=6

## Days Lost
- Mon 10 Aug: unrecorded
- Tue 11 Aug: unrecorded
- Wed 12 Aug: unrecorded (today)
- Thu 13 Aug: STILL RECOVERABLE
- Fri 14 Aug: STILL RECOVERABLE (course end)

## Fix Recipe - NOT YET RUN

Step 1: INSERT into StudentClassAssignment
  booking_course_id=25043, student_id=14602, class_id=6
  week_start=2026-08-10, week_end=2026-08-14

Step 2: Mark Thu 13 + Fri 14 attendance on Class 6 sheet manually.

## Risk
Category: Bookings/Attendance. Reversible (delete SCA if wrong).
Blast radius: single student, single week.
URGENCY: CRITICAL - course ends Fri 14 Aug 2026 (2 days).

## Status
Fix NOT RUN. 3 of 5 days missed. 2 remain.
Last checked: Wed 12 Aug 2026 UTC (133rd check)
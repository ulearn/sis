Issue 38 - Eduardo Roche Diaz - BC25043 CRITICAL (136th check 12 Aug 2026)

Reporter: PG  Area: Booking/Class  Sheet row: 40

Symptom: BC 25043 (General English PM, 10-14 Aug 2026) has 0 class assignments. Course ends Friday 14 Aug 2026.

Root Cause (unchanged, 136th check):
BC 25043: student_id=14602 (Eduardo Roche Diaz), booking_id=18265 - no SCA ever inserted.
DB confirmed (136th check, Wed 12 Aug UTC): classAssignments = [] (0 records).
Reference: BC 25038 had SCA 421 for Aug 3-7. BC 25043 created without SCA.

Days Lost / Remaining (136th check):
- Mon 10 Aug 2026: school day - 0 attendance recorded
- Tue 11 Aug 2026: school day - 0 attendance recorded
- Wed 12 Aug 2026: school day - 0 attendance recorded (today)
- Thu 13 Aug 2026: 1 school day remaining (tomorrow)
- Fri 14 Aug 2026: 1 school day remaining (course end)
Total: 3 of 5 school days lost. 2 remain.

Fix Recipe - NOT YET RUN:
  Via SIS admin: Student 14602 (Eduardo Roche Diaz) -> Booking 18265 -> BC 25043
  -> assign class 6 (B2+C1 PM), weekStart 2026-08-10, weekEnd 2026-08-14
  -> mark Thu 13 + Fri 14 Aug attendance on Class 6 via SIS attendance UI

  DB insert (NOT YET RUN):
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES (25043, 14602, 6, 2026-08-10, 2026-08-14);

Risk: bookings/attendance. Reversible. Blast radius: 1 student, 1 week.
URGENCY: CRITICAL - course ends Fri 14 Aug 2026. Only 2 school days remain.

Status: Fix NOT RUN. 136 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC (136th check)
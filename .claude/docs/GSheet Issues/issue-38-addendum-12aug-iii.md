# Issue 38 — Eduardo Roche Diaz — BC 25043 CRITICAL (137th check 12 Aug 2026)

Reporter: PG  Area: Booking / Class  Sheet row: 40

Symptom: BC 25043 (General English PM, 10-14 Aug 2026) has 0 class assignments. Course ends Fri 14 Aug 2026.

Root Cause (unchanged, 137th check):
- Booking Course 25043: student 14602 (Eduardo Roche Diaz), booking 18265 — no student class assignment ever inserted
- DB confirmed (137th check, Wed 12 Aug UTC): studentClassAssignment count = 0
- Booking 18265: CONFIRMED, confirmed = true, payment 18086 = EUR 126

Days Lost / Remaining (137th check):
- Mon 10 Aug 2026: school day — 0 attendance recorded
- Tue 11 Aug 2026: school day — 0 attendance recorded
- Wed 12 Aug 2026: school day — 0 attendance recorded (today)
- Thu 13 Aug 2026: school day remaining (tomorrow)
- Fri 14 Aug 2026: school day remaining (course end)
Total: 3 of 5 school days lost. 2 remain.

Fix Recipe — NOT YET RUN:
Via SIS admin: Student 14602 -> Booking 18265 -> Booking Course 25043
-> assign class 6 (B2+C1 PM), weekStart 2026-08-10

Direct DB insert (NOT YET RUN):
INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
VALUES (25043, 14602, 6, '2026-08-10', '2026-08-14');

After inserting: mark Thu 13 + Fri 14 Aug attendance via SIS attendance UI for class 6.

Risk / Category:
- Category: bookings / attendance. Reversible. Blast radius: 1 student, 1 week.
- URGENCY: CRITICAL — course ends Fri 14 Aug 2026. Only 2 school days remain (Thu + Fri).

Status: Fix NOT RUN. 137 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC (137th check)
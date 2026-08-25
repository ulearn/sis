Issue 24 - Alberto Squillace: Fee Null + No Class (Addendum 22 Jul 2026 C)
Reporter: PG | Area: Booking | Sheet row: 25

Root cause (45th hourly check, Wed 22 Jul 2026 UTC, 121st total):
- BC24686 (Alberto Squillace, student 1052, booking 1611): Morning General, 20 Jul to 18 Sep 2026
- fee = null — course fee missing; blocks invoicing and certificates
- Zero class assignments — Day 3 since course start (Mon 20 Jul)
- Booking 1611: CONFIRMED, confirmed=true, EUR 1280.12/1280.12 fully paid
UNCHANGED. Fix NOT RUN.

Fix recipe (NOT YET RUN):
1. Set fee on BC24686 via SIS admin: Booking 1611 > Courses > BC24686 > edit fee (Morning General rate)
2. INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
   VALUES (24686, class_id, 2026-07-20, 2026-07-24); -- this week and onwards through Sep 18

Status: Day 3. UNCHANGED. 45th hourly check 121st total. Fix NOT RUN. Last checked: Wed 22 Jul 2026 UTC.
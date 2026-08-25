Issue 39 - Xuezhen Huang (Addendum 26 Jul 2026 C)

Reporter: KC | Area: Booking/Accomm | Sheet row: 41

Root cause (fresh data 26 Jul 2026 UTC):
- Booking course 24609 (Morning General, Jul 13-31 2026): active=true, fee=570, 0 class assignments
- 10 school days missed (Jul 14-25, weeks 1+2), irrecoverable
- Mon 27 Jul 2026 = FINAL WINDOW (TOMORROW); course ends Jul 31
- 5 school days remain (Jul 27-31)
- Accommodation 11357 (Jul 12-Aug 2, bed 180, Host Family): active=true, correct
- Booking 17831: student 14443 Xuezhen Huang, status=CONFIRMED

Fix recipe (NOT YET RUN):
ASSIGN BC 24609 to Morning General wb Mon 27 Jul - FINAL WINDOW TOMORROW
1. Find Morning General class for week of 27 Jul in SIS admin
2. INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, student_id)
   VALUES (24609, <class_id>, 2026-07-27, 2026-07-31, 14443);

Risk/Category: bookings/attendance, reversible
URGENCY: CRITICAL - FINAL WINDOW tomorrow Mon 27 Jul. Course ends Jul 31.

Status: OPEN - Fix NOT RUN. 10 days (Jul 14-25) permanently missed. 5 remain if acted tomorrow.
Last checked: 26 Jul 2026 UTC (108th hourly run)
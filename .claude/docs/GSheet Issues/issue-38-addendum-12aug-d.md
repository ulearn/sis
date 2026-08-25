Issue 38: Eduardo Roche Diaz (129th check, 12 Aug 2026)
Reporter: AC | Sheet row: 40

Wed 12 Aug 2026 UTC. 129th check. No change since 128th. BC 25043 still 0 class assignments. CRITICAL: ends Fri 14 Aug (2 days).

Root Cause:
- BC 25043 (bookingId 18265, student 14602): General English PM, 10-14 Aug 2026, active=true, 0 SCAs (day 3 of 5)
- Booking 18233 -> BC 25011 (Jul 20-24): SCA 356, classId 6 confirmed
- Booking 18245 -> BC 25023 (Jul 27-31): SCA 359, classId 6 confirmed
- Booking 18258 -> BC 25038 (Aug 3-7): SCA 421, classId 6 confirmed
- Booking 18265 -> BC 25043 (Aug 10-14): 0 SCAs MISSING
- Class 6 = B2+C1 PM (afternoon, active). Pattern unambiguous.

Fix Recipe (NOT YET RUN):
Option A: SIS admin UI -> BC 25043 -> assign Class 6, week 10-14 Aug 2026
Option B: INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end) VALUES (25043, 14602, 6, '2026-08-10', '2026-08-14');
Verify: SELECT * FROM student_class_assignments WHERE booking_course_id = 25043;

Risk: bookings/attendance | Reversible: yes | Blast radius: 1 student, 1 week
Status: CRITICAL - 0 class assignments. Course ends Fri 14 Aug 2026 (2 days). Fix NOT RUN.
Last checked: Wed 12 Aug 2026 UTC (129th check)
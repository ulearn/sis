Issue 39 - Xuezhen Huang - 0 SCAs, Course Ends 31 Jul - Addendum 27 Jul 2026 (g)

Reporter: AC | Area: Booking/Accomm | Sheet row: 41 | Last checked: 2026-07-27 UTC

Root Cause (fresh DB 2026-07-27)

Student 14443 (Xuezhen Huang), booking 17831: CONFIRMED, EUR 1396.90 fully paid (UP from EUR 570 in PM run - payment received since then). Accommodation BA 11358: Host Family, bed 180, 12 Jul-2 Aug 2026, active=true, fee EUR 900 - PRESENT. BC 24609 (Morning General, 13 Jul-31 Jul 2026): active=true, 0 class assignments. Student in school 14 days with no SCA. Course ends 31 Jul (4 days).

Fix Recipe (NOT YET RUN)

  SIS Admin -> Classes -> Morning General -> assign student 14443 / BC 24609
  week_start=2026-07-28, week_end=2026-07-31

  Verify: SELECT * FROM student_class_assignments WHERE booking_course_id=24609;

Risk: bookings/class. Reversible: yes. 1 student.

Status: CRITICAL - 4 days left. Fix NOT RUN. Last checked: 2026-07-27 UTC

Issue 15 - service_end EXPIRED (53rd check)
Reporter: PG | Area: booking/class | Sheet row: 16

Status Update: Fri 7 Aug 2026 UTC (53rd check, hours after midnight)
service_end EXPIRED midnight UTC today. Fix NOT RUN. Booking not updated since 8 Jul 2026 (30 days ago).

Root Cause (verified this check)
- Booking 18151 (student 1001, Saikhantes Shagdarsuren): CONFIRMED, confirmed=true, fully paid EUR 1,339.20
- service_end = 2026-08-07T00:00:00.000Z - EXPIRED; student portal locked NOW
- Booking Course 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active, correct
- service_end is 57 days shorter than BC end date (Oct 2) - discrepancy
- Last SCA id 255: class 11 (B1 PM), week_end 2026-07-03 (35 days without new SCA)
- Student on holiday until Mon 24 Aug 2026
- Student 1001 visa_status = null

Fix Recipe (NOT YET RUN)
Step 1 IMMEDIATE - restore portal access:
  UPDATE bookings SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;

Step 2 - SCA for return from holiday (before 24 Aug):
  In SIS Admin: assign student 1001 to class 11 (B1 PM) for week starting 2026-08-24.
  Or SQL: INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end, created_at, updated_at)
  VALUES (1001, 11, 24925, '2026-08-24', '2026-10-02', NOW(), NOW());

Step 3 - set visa_status if confirmed:
  UPDATE students SET visa_status = 'approved' WHERE id = 1001;

Step 4 verify:
  SELECT id, service_end, updated_at FROM bookings WHERE id = 18151;
  SELECT id, class_id, week_end FROM student_class_assignments WHERE booking_course_id = 24925 ORDER BY week_end DESC LIMIT 3;

Risk: CRITICAL - student portal locked NOW | reversible | single student.
Status: Fix NOT RUN. service_end expired midnight 7 Aug 2026. Last checked: Fri 7 Aug 2026 UTC (53rd hourly check).
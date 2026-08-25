Issue 15 Addendum 7 Aug 2026 (service_end EXPIRED)

Reporter: pg | Row: 16 | Last checked: Fri 7 Aug 2026 UTC

ROOT CAUSE
- Booking 18151: CONFIRMED, confirmed=true, amount_paid=EUR 1339.20
- service_end = 2026-08-07T00:00:00.000Z EXPIRED AT MIDNIGHT UTC TODAY
- Student (Saikhantes Shagdarsuren, id 1001) locked out of portal NOW
- Last DB update: 2026-07-08 (30 days ago) fix NOT applied
- BC 24925 (AY Afternoon, 9 Mar to 2 Oct 2026): active, correct dates
- Last SCA 255: class 11 (B1 PM), week_end=2026-07-03, 35 days without new SCA
- Student on holiday until Mon 24 Aug 2026 (17 days from today)
- Student 1001 visa_status = null

FIX RECIPE (NOT YET RUN)

Step 1 - Update service_end on booking 18151 IMMEDIATE
  SQL: UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;
  Matches BC 24925 end date. Restores portal access.

Step 2 - Create SCA for return from holiday (before 24 Aug)
  In SIS Admin, assign student 1001 to class 11 (B1 PM), week starting 2026-08-24.
  Or SQL (verify class 11 still correct first):
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end, created_at, updated_at)
  VALUES (1001, 11, 24925, '2026-08-24', '2026-10-02', NOW(), NOW());

Step 3 - Verify after fix
  SELECT id, service_end, updated_at FROM bookings WHERE id = 18151;
  SELECT id, class_id, week_end FROM student_class_assignments WHERE booking_course_id = 24925 ORDER BY week_end DESC LIMIT 5;

RISK: bookings/student-access | reversible | single student | CRITICAL

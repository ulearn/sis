Issue 15/29 -- Saikhantes Shagdarsuren (student 1001, booking 18151)
Reporter: PG | Area: Booking/Class | Rows: 16 (Issue 15), 30 (Issue 29&15)
138th check (row 16) / 104th check (row 30) | Sun 16 Aug 2026 UTC

Booking 18151: CONFIRMED, EUR 1339.20 total = EUR 1339.20 paid (fully settled)
  service_start: 2026-01-12 | service_end: 2026-08-07
  service_end EXPIRED 9 days ago. Student returns Fri 21 Aug (5 days).

BC 24925 (Academic Year Afternoon):
  startDate: 2026-03-09 | endDate: 2026-10-02 | active=true | ilepCode: 0318/0003
  BC ends Oct 2 but service_end is Aug 7 -- mismatch.

SCA 255 (class 11): week_start 2026-01-12, week_end 2026-07-03
  EXPIRED 44 days ago. No new SCA for post-summer return.

Original issue (row 30): booking start 12/01/2026 = deliberate Fidelo restart date (confirmed).

FIX RECIPE (NOT YET RUN)

Step 1 -- Extend service_end to match BC end date:
  UPDATE bookings SET service_end='2026-10-02' WHERE id=18151;

Step 2 -- Create SCA for return week (Mon 24 Aug, class 11):
  Student returns Fri 21 Aug; first full class week starts Mon 24 Aug.
  INSERT INTO student_class_assignments (class_id,week_start,week_end,booking_course_id,created_at,updated_at)
  VALUES (11,'2026-08-24','2026-10-02',24925,NOW(),NOW());
  Confirm week_end with staff (may need Christmas shunt adjustment).

Step 3 -- Verify:
  SELECT id,class_id,week_start,week_end FROM student_class_assignments
  WHERE booking_course_id=24925 ORDER BY week_start;

Risk: Bookings/Class | Reversible: yes | Blast radius: 1 student
Status: Fix NOT RUN. Student returns Fri 21 Aug (5d). service_end 9d expired. Action before Aug 21.

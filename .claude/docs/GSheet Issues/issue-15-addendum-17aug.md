Issue 15 -- Saikhantes Shagdarsuren (student 1001, booking 18151)
Reporter: | Area: Booking/Class | Row 16 | 139th check Mon 17 Aug 2026 UTC

Booking 18151: CONFIRMED, EUR 1,339.20 fully paid, amount_open = 0
service_end = 2026-08-07 -- EXPIRED 10 DAYS AGO
Booking Course 24925 (Academic Year Afternoon): Mar 9 - Oct 2 2026, active=true
Student Class Assignment 255: class 11, week_start Jan 12, week_end Jul 3 2026 -- EXPIRED 45 DAYS AGO
Student returns Fri 21 Aug 2026 = 4 DAYS FROM NOW
No new SCA exists for the return week or beyond

FIX RECIPE (NOT YET RUN)

Step 1 -- Extend service_end to match BC 24925 end date:
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Step 2 -- Create new SCA for week of 24 Aug (first full Mon after return Fri 21):
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, student_id)
  VALUES (24925, 11, '2026-08-24', '2026-10-02', 1001);

Step 3 -- Verify no gap:
  SELECT * FROM student_class_assignments WHERE student_id = 1001 ORDER BY week_start;

Risk: Bookings/Class | Reversible: yes | Blast radius: 1 student
Status: Fix NOT RUN. Returns in 4 days. service_end expired 10d. SCA expired 45d.
Last checked: 2026-08-17 UTC (139th check)

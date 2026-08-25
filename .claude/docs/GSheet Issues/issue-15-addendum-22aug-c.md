# Issue 15 Addendum 22 Aug 2026 (c) — Saikhantes Class Assignment Gap

Sheet row: 16 | Student: 1001 (Saikhantes Shagdarsuren)

Root cause (201st check, 8th today):
- Booking Course 24925 (Academic Year Afternoon): active, Mar 9 to Oct 2, 2026.
- Only 1 SCA on record: id 255, weekStart 2026-01-12, weekEnd 2026-07-03, class 11.
- Gap: Jul 3 to Aug 22 = 50 days with no active class assignment.
- 41 days remaining on Booking Course (ends Oct 2).
- Deadline: Mon 24 Aug 2026 = 2 DAYS. Fix still not run.

Fix recipe (NOT YET RUN):

Step 1 — Identify available AY Afternoon class slot from Aug 22 onward.

Step 2 — Create Student Class Assignment:
  INSERT INTO student_class_assignment
    (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES
    (24925, 1001, <class_id>, '<start_date>', '<end_date>');

Step 3 — Verify:
  SELECT id, booking_course_id, student_id, class_id, week_start, week_end
  FROM student_class_assignment WHERE booking_course_id = 24925;

Risk: Bookings / data-hygiene. Reversible. Single student 1001. Time-sensitive: Mon 24 Aug deadline.
Status: OPEN — fix not run.
Last checked: Sat 22 Aug 2026 UTC (201st check, 8th today)

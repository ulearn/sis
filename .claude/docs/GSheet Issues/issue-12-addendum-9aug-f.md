# Issue 12 -- Rakan Alghamdi (Student 14444): SCA 288 Still Mislinked
Check: 138th, Sun 9 Aug 2026 UTC (3rd today) | Reporter: AC | Row: 13

ROOT CAUSE
Booking Course 24697 (Academic Year Morning, booking 17915): ended 31 Jul 2026 -- 9 days stale, active = true.
Student class assignment 288 still on Booking Course 24697: class 12, week start 2026-07-06.
Booking Course 25035 (GE AY AM Plus, 3 Aug-18 Dec 2026): active = true, 0 class assignments.
Rakan (student 14444) has been without a class assignment for 6 days since new term started.
CRITICAL: classes start TOMORROW Mon 10 Aug 2026.

FIX RECIPE -- NOT YET RUN

Step 1: Deactivate Booking Course 24697
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24697;

Step 2: Relink SCA 288 to Booking Course 25035 (weekStart=Aug 10)
  UPDATE student_class_assignments
  SET booking_course_id = 25035, week_start = '2026-08-10', updated_at = NOW()
  WHERE id = 288;

Step 3: Verify
  SELECT id, class_id, week_start, booking_course_id FROM student_class_assignments WHERE id = 288;
  Expect: booking_course_id=25035, week_start=2026-08-10

  SELECT id, active FROM booking_courses WHERE id IN (24697, 25035);
  Expect: 24697 active=false, 25035 active=true

RISK: Category=Bookings/class assignments | Reversible=Yes
Blast radius: Single student (Rakan Alghamdi, 14444) -- class list / attendance only
Urgency: CRITICAL -- classes start Mon 10 Aug 2026

STATUS: Open -- Fix NOT RUN
Last checked: Sun 9 Aug 2026 UTC (138th check, 3rd today)

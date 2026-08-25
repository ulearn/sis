# Issue 12 -- Rakan Alghamdi (Student 14444): SCA 288 Still Mislinked
Check: 140th, Sun 9 Aug 2026 UTC (5th today) | Reporter: AC | Row: 13

ROOT CAUSE (fresh query Sun 9 Aug 2026 UTC -- 5th check today, NO CHANGE)
- Booking Course 25035 (GE AY AM Plus, booking 17915): active = true, startDate = 2026-08-03, 0 class assignments.
- Student Class Assignment 288: bookingCourseId = 24697 (old course), classId = 12, weekStart = 2026-07-06. Not yet moved.
- Booking Course 24697 (Academic Year Morning): endDate = 2026-07-31, still active = true (10 days stale).
- Rakan has been without a class assignment for 7 days since new course started.
- CRITICAL: classes start tomorrow Mon 10 Aug 2026 at 09:00.

FIX RECIPE -- NOT YET RUN

Step 1: Deactivate old Booking Course 24697
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24697;

Step 2: Relink SCA 288 to BC 25035 with week_start = 2026-08-10
  UPDATE student_class_assignments SET booking_course_id = 25035, week_start = '2026-08-10' WHERE id = 288;

Step 3: Verify
  SELECT id, booking_course_id, class_id, week_start FROM student_class_assignments WHERE id = 288;
  -- Expect: booking_course_id = 25035, week_start = 2026-08-10
  SELECT id, active FROM booking_courses WHERE id IN (24697, 25035);
  -- Expect: 24697 active = false, 25035 active = true

RISK: Category = Bookings / class assignments | Reversible = Yes
Blast radius: Single student (Rakan Alghamdi, stu 14444) -- class list and attendance only
Urgency: CRITICAL -- classes start Mon 10 Aug 2026 at 09:00

STATUS: Open -- Fix NOT RUN
Last checked: Sun 9 Aug 2026 UTC (140th check, 5th today)

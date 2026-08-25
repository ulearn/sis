ISSUE 12 -- Rakan Alghamdi (student 14444)
Reporter: AC | Area: Booking/Accomm | Sheet row 13

SYMPTOM
SCA 288 linked to BC 24697 (ended Jul 31 2026). Current BC 25035 (started Aug 3 2026)
has 0 class assignments. Rakan unclassed for 20 days.

ROOT CAUSE (193rd check, Sun 23 Aug 2026 UTC)
- Student 14444 (Rakan Alghamdi)
- SCA 288: class 12 (B1 AM (2)), weekStart 2026-07-06, weekEnd 2026-12-18, on BC 24697
- BC 24697 (Academic Year Morning): ended 2026-07-31, active = true -- 23 days stale, 1 SCA attached
- BC 25035 (General English Academic Year AM Plus, bk 17915): started 2026-08-03, ends 2027-01-08, active, 0 SCAs
- Rakan has been unclassed for 20 days (Aug 3 to Aug 23 2026)
- SCA 288 weekEnd (Dec 18 2026) extends far beyond BC 24697 end (Jul 31) -- anomalous

FIX RECIPE (NOT YET RUN)

Step 1 -- Verify current state:
  SELECT id, class_id, booking_course_id, week_start, week_end
  FROM student_class_assignments WHERE student_id = 14444;
  SELECT id, name, start_date, end_date, active FROM booking_course WHERE id IN (24697, 25035);

Step 2 -- Trim SCA 288 weekEnd to BC 24697 end date:
  UPDATE student_class_assignments SET week_end = '2026-07-31' WHERE id = 288;

Step 3 -- Deactivate stale BC 24697:
  UPDATE booking_course SET active = false WHERE id = 24697;

Step 4 -- Create new SCA on BC 25035:
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end, created_at)
  VALUES (14444, 12, 25035, '2026-08-03', '2027-01-08', NOW());
  -- class 12 = B1 AM (2) -- confirm with AC/Paul still correct class for Rakan

RISK: bookings / data-hygiene. Reversible. Blast radius: Rakan only.
Urgency: HIGH -- 20 days unclassed; BC 25035 runs to Jan 2027.

STATUS: OPEN -- Fix NOT RUN
Last checked: 2026-08-23 UTC (193rd hourly run)

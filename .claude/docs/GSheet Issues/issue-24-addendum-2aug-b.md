Issue 24 - Alberto Squillace (student 1052) - SCA needed; starts Tuesday Aug 4
Reporter: PG | Area: Booking | Sheet row: 25

Symptom
Migration anomaly: two booking courses. BC 24686 has no class assignment and fee=null.
Student starts Tuesday 4 Aug 2026 (day after August Bank Holiday).

Root cause - 25th check Sun 2 Aug 2026 UTC (5th today)
- Student 1052 (Alberto Squillace), booking 1611: CONFIRMED, paid EUR 1,280.12, open=0.
- Booking course 24686 (Morning General, Jul 20-Sep 18 2026): active=true, fee=null, 0 class assignments.
- Booking course 1797 (Morning General, Apr 6-Jun 26 2026): active=true - ended 37 days ago.
- Last class assignment: class 12, Apr 26 2026 on BC 1797 - 99 days since last SCA.
- No holidays in booking_holidays for booking 1611.
- Student on extended bereavement leave; returns Tue 4 Aug 2026 (post-Bank Holiday).

Fix recipe - NOT YET RUN

Step 1: Set fee on BC 24686
  SELECT id,name,fee FROM booking_courses WHERE name='Morning General' AND fee IS NOT NULL LIMIT 5;
  BC 24686 runs Jul 20-Sep 18 = 9 weeks. Confirm appropriate fee with Paul/accounts.
  UPDATE booking_courses SET fee=<agreed_fee> WHERE id=24686;

Step 2: Create class assignment for Aug 4 return
  Confirm class with Paul (was class 12 on BC 1797):
  INSERT INTO student_class_assignments (booking_course_id,class_id,week_start,week_end)
  VALUES (24686,<class_id>,'2026-08-04','2026-09-18');
  Note: Aug 3 is Bank Holiday (school closed). First class day is Aug 4.

Step 3: Deactivate BC 1797
  UPDATE booking_courses SET active=false WHERE id=1797;
  BC 1797: Morning General, Apr 6-Jun 26 2026 - ended 37 days ago.

Step 4: Verify
  SELECT id,name,start_date,end_date,active,fee FROM booking_courses WHERE booking_id=1611;
  -- BC 1797: active=false; BC 24686: active=true, fee set
  SELECT id,class_id,week_start,week_end FROM student_class_assignments WHERE booking_course_id=24686;
  -- 1 SCA returned

Risk: bookings (class assignment gap + fee data) | Reversible: Yes | Blast radius: 1 student
Time-sensitive: student starts Tuesday 4 Aug 2026 (action needed today).

Status: Open - NOT YET RUN
Last checked: Sun 2 Aug 2026 UTC (25th check, 5th today)
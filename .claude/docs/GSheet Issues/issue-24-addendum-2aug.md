Issue 24 - Alberto Squillace (student 1052) - SCA needed; starts Tuesday Aug 4
Reporter: PG | Area: Booking | Sheet row: 25

Symptom
Migration anomaly: student has two courses in SIS. Extended bereavement leave not in SIS.
BC 24686 has no class assignment and no fee set. Student starts Tuesday 4 Aug.

Root cause - 23rd check Sun 2 Aug 2026 UTC (3rd today)
- Student 1052 (Alberto Squillace), booking 1611: CONFIRMED, confirmed=true, paid EUR 1,280.12, open=0.
- BC 24686 (Morning General, Jul 20-Sep 18 2026, booking 1611): active=true, fee=null, 0 class assignments.
- BC 1797 (Morning General, Apr 6-Jun 26 2026, booking 1611): active=true - 37 days stale.
- Last SCA: class 12, Apr 6-Apr 26 2026 on BC 1797 - 97 days since last class assignment.
- No holidays recorded in booking_holidays for booking 1611.
- Student on extended bereavement leave; returns to class Tuesday 4 Aug 2026 (post-BH).
- BC 24686 start_date is Jul 20 but student has not been assigned to any class.

Fix recipe - NOT YET RUN

Step 1: Set fee on BC 24686
  Check fees on similar Morning General BCs:
  SELECT id, name, fee FROM booking_courses WHERE name = Morning General AND active = true AND fee IS NOT NULL LIMIT 5;
  Booking 1611 total paid EUR 1,280.12 - confirm this covers BC 24686 (approx 9 weeks)
  UPDATE booking_courses SET fee = agreed_fee_total WHERE id = 24686;

Step 2: Create SCA for week of Aug 4 (first class day post-BH)
  Confirm class with Paul (was class 12 previously on BC 1797):
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (24686, class_id, 2026-08-04, 2026-09-18);
  week_start = Aug 4 (Tuesday post-BH); week_end = Sep 18 (BC end)
  Confirm week_start convention with Paul (Monday vs Tuesday after BH)

Step 3: Deactivate BC 1797
  UPDATE booking_courses SET active = false WHERE id = 1797;
  BC 1797: Morning General, Apr 6-Jun 26 2026 - 37 days stale

Step 4: Verify
  SELECT id, name, start_date, end_date, active, fee FROM booking_courses WHERE booking_id = 1611;
  -- BC 1797: active=false; BC 24686: active=true, fee set
  SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 24686;
  -- 1 SCA returned

Risk / category
Category: bookings (class assignment gap + fee data) | Reversible: Yes
Blast radius: 1 student; 97 days without class assignment

Status: Open - NOT YET RUN (student starts Tuesday Aug 4 - action needed today)
Last checked: Sun 2 Aug 2026 UTC (22nd check, 2nd today)

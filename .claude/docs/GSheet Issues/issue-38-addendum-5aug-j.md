Issue 38 - Addendum 5 Aug 2026 (j) - URGENT: BC25004 + BC25005 Still Unassigned, Deadline 2 Days
Reporter: Diego/Paul | Area: Holidays, Bookings, Classes | Sheet row: 40

28th check Wed 5 Aug 2026 UTC.

Symptom
Booking Courses 25004 (Vincenzo Contu) and 25005 (Claudia Mereu) start Monday 10 Aug 2026
with 0 class assignments. Deadline: Friday 7 Aug 2026 (2 days from now).

Root Cause
Staff have not yet assigned these students to a class in SIS. Live DB confirmed this check.

- BC 25004 (Vincenzo Contu, student 14597): General English AM Plus, Aug 10-14 2026, active=true, assignments=0
- BC 25005 (Claudia Mereu, student 14598): General English AM, Aug 10-14 2026, active=true, assignments=0

Previously resolved (26th check):
- BC 88    (Africa Mera Bachir, student 76):     Aug 3-7 2026 -- assigned + attendance entered
- BC 25038 (Eduardo Roche Diaz, student 14602): Aug 3-7 2026 -- assigned + attendance entered

Fix Recipe (NOT YET RUN)

Step 1 -- BY FRIDAY 7 AUG: Assign Vincenzo Contu (Booking Course 25004) (NOT YET RUN)
  SIS admin: Classes > To Be Assigned > Booking Course 25004
  Assign to General English AM Plus class, week Mon 10 Aug.

Step 2 -- BY FRIDAY 7 AUG: Assign Claudia Mereu (Booking Course 25005) (NOT YET RUN)
  SIS admin: Classes > To Be Assigned > Booking Course 25005
  Assign to General English AM class, week Mon 10 Aug.

Fallback direct SQL (NOT YET RUN):
  SELECT id, name FROM classes WHERE name ILIKE '%AM Plus%' LIMIT 10;
  SELECT id, name FROM classes WHERE name ILIKE '%General English AM%' LIMIT 10;
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start_date, week_end_date, created_at, updated_at)
  VALUES (25004, <class_id_plus>, '2026-08-10', '2026-08-14', NOW(), NOW());
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start_date, week_end_date, created_at, updated_at)
  VALUES (25005, <class_id_am>, '2026-08-10', '2026-08-14', NOW(), NOW());

Risk
Category: Bookings / Classes
Severity: HIGH -- students start Monday 10 Aug without a class placement
Reversible: Yes -- delete the student_class_assignment row if wrong class

Status: Pending -- fix NOT YET RUN
Last checked: Wed 5 Aug 2026 UTC (28th hourly run)
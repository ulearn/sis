Issue 24 -- Alberto Squillace Class Assignment (123rd run, Mon 27 Jul 2026 UTC)
Reporter: PG | Area: Booking / Class | Sheet row: 25

SYMPTOM
Migration problem? Two courses in SIS. Second course BC 24686 has no class assignment.

ROOT CAUSE (fresh DB Mon 27 Jul UTC)
BC 24686 (Morning General, Jul 20 - Sep 18 2026): active = true, fee = null, 0 student class assignments.
Alberto Squillace student 1052, booking 1611.
Stale: BC 1797 (ended Jun 26): still active = true (31 days stale).

Days lost: 6 school days (week 1 Jul 20-24 = 5d, Mon Jul 27 week 2 day 1 = 1d).
Booking course ends Sep 18 2026 -- still time to recover most weeks.

FIX RECIPE (NOT YET RUN)

Step 1 -- Set fee on BC 24686 (fee is currently null):
  Check the booking 1611 / HubSpot deal for the correct Morning General fee.
  UPDATE booking_courses SET fee = <correct_fee> WHERE id = 24686;

Step 2 -- Assign BC 24686 to Morning General class in SIS admin:
  Navigate: SIS Admin > Students > Alberto Squillace (1052) > Booking 1611
  Find booking course BC 24686 (Morning General, Jul 20 - Sep 18)
  Assign to appropriate Morning General class
  weekStart = 2026-07-27 (start from this week) | weekEnd = 2026-09-18 (course end)

Step 3 -- Deactivate stale BC 1797:
  UPDATE booking_courses SET active = false WHERE id = 1797 AND active = true;

Step 4 -- Verify:
  SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 24686;

RISK / CATEGORY
Category: Class assignment / data hygiene | Reversible: Yes | Blast radius: 1 student + 1 stale BC

STATUS: URGENT -- Fix NOT RUN | Last checked: Mon 27 Jul 2026 UTC | Week 2 ongoing, 6d lost
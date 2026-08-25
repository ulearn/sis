Issue 24 - Alberto Squillace (student 1052)
Reporter: AC | Area: Booking | Sheet row 25

SYMPTOM: SIS created new course from Jul 27 instead of splitting original; student not in class assignments.

ROOT CAUSE (119th check Sun 26 Jul 2026 UTC):
- Booking course 24686 (Morning General, Jul 20-Sep 18 2026): active=true, 0 class assignments, fee=null
- Booking 2385 (student 1052 Alberto Squillace)
- Week 1 (Jul 20-24): 5 school days lost - irrecoverable
- Week 2 starts Mon Jul 27 - 5 more days at risk if not fixed this week
- fee=null on BC24686 - needs to be set

FIX RECIPE (NOT YET RUN):
Step 1 - Determine correct fee: check HubSpot deal for booking 2385 (9-week Morning General Jul 20-Sep 18).

Step 2 - Set fee on BC24686 (NOT YET RUN):
  UPDATE booking_course SET fee = <amount>, updated_at = NOW() WHERE id = 24686;

Step 3 - Find Morning General class ID (NOT YET RUN):
  SELECT id, name FROM class WHERE name ILIKE '%morning general%' AND active = true;

Step 4 - Assign BC24686 to class starting Mon Jul 27 (NOT YET RUN):
  INSERT INTO student_class_assignment (booking_course_id, class_id, week_start, week_end, created_at, updated_at) VALUES (24686, <class_id>, '2026-07-27', '2026-09-18', NOW(), NOW());

RISK: Category bookings/class-assignment | Reversible yes | Blast radius single student
STATUS: OPEN - 119th check Sun 26 Jul 2026 UTC. Week 2 underway. Fix NOT RUN. Last checked: 2026-07-26 UTC
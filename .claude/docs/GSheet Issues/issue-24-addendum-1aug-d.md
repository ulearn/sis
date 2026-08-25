# Issue 24 — Alberto Squillace Class Assignment

Reporter: PG | Area: Booking | Sheet row: 25 | Check: 15th (8th Sat 1 Aug 2026 UTC)

## Symptom
Migration issue: two booking courses on booking 1611 for Alberto Squillace. BC 24686 (Jul 20 to Sep 18) has no class assignment and fee = null. Class information still needed from Paul.

## Root Cause (fresh DB — NOT YET FIXED)

Student: Alberto Squillace (student not found via booking 17827 — actual booking is 1611).

Booking course 24686 (Morning General, 20 Jul to 18 Sep 2026): active = true, fee = null, 0 class assignments. This is the live course.

Booking course 1797 (Morning General, 6 Apr to 26 Jun 2026): active = true — 36 days stale (ended Jun 26). Class assignment 229 (class 12, week start Apr 6) exists on this old course only.

10 teaching weekdays lost (Jul 20 to Jul 31). Next class day is Tue Aug 4 (Aug 3 = August Bank Holiday per Issue 38).

Info still needed from Paul: which class should BC 24686 be assigned to, and what is the correct fee.

## Fix Recipe (NOT YET RUN)

Pre-step — Confirm with Paul: class number for BC 24686 and correct fee.

Step 1 — Set fee on booking course 24686:
  UPDATE booking_courses SET fee = <confirmed_fee> WHERE id = 24686;

Step 2 — Create class assignment on BC 24686:
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, created_at)
  VALUES (24686, <confirmed_class_id>, '2026-07-20', '2026-09-18', NOW());

Step 3 — Deactivate stale booking course 1797:
  UPDATE booking_courses SET active = false WHERE id = 1797;

Step 4 — Verify:
  SELECT sca.id, sca.class_id, sca.week_start, sca.week_end FROM student_class_assignments sca
  WHERE sca.booking_course_id = 24686;
  SELECT id, name, start_date, end_date, active, fee FROM booking_courses WHERE id IN (1797, 24686);

## Risk
Category: bookings, class assignment. Reversible: yes. Blast radius: 1 student.
URGENT — next class day is Tue Aug 4; student has had no class assignment for 10 school days.

## Status
Open — 15th check (8th today Sat 1 Aug). NOT FIXED. Awaiting class/fee confirmation from Paul.
Last checked: 2026-08-01 UTC
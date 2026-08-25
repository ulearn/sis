# Issue 24 - Alberto Squillace (Student 1052, Booking 1611) - 12 Days Lost

Reporter: PG | Area: Booking | Sheet row: 25 | Check: 12th (5th Sat 1 Aug 2026 UTC)

## Symptom
Migration problem: bereavement holidays in Fidelo. SIS has 2 courses -- BC 1797 (ended Jun 26) and BC 24686 (started Jul 20, fee=null, 0 SCAs). Teaching days being lost.

## Current State (fresh DB -- NOT YET FIXED)

BC 1797 (Morning General, Apr 6-Jun 26 2026): active=true (stale 36 days), fee=EUR 1,836.
  SCA 229: class 12, week_start=2026-04-06 (only 1 SCA on this old course, covering 3 weeks).

BC 24686 (Morning General, Jul 20-Sep 18 2026): active=true, fee=null.
  0 student class assignments.
  12 teaching days lost (weekdays Jul 20-31; Aug 1 is Saturday).
  Next possible class: 2026-08-04 (Aug 3 = August Bank Holiday, see Issue 38).
  32 days remain (Aug 4 through Sep 18).

## Fix Recipe (NOT YET RUN)

Step 1 - Set fee on BC 24686 (confirm with Paul / sales team):
  UPDATE booking_courses SET fee = <confirmed_amount> WHERE id = 24686;

Step 2 - Create SCA on BC 24686 (confirm class with academic team):
  In SIS Admin -> Booking 1611 -> BC 24686 -> Assign class.
  week_start: 2026-08-04 (first class after August Bank Holiday).

Step 3 - Deactivate stale BC 1797:
  UPDATE booking_courses SET active=false WHERE id = 1797;

Step 4 - Verify:
  SELECT id, active, fee FROM booking_courses WHERE id IN (1797, 24686);
  SELECT id, class_id, week_start FROM student_class_assignments WHERE booking_course_id = 24686;

## Risk
Category: bookings, data-hygiene. Reversible: yes. Blast radius: single student.
Urgency: high -- 12 teaching days lost; first class possible Aug 4.
Info needed: class assignment + fee from Paul / academic team.

## Status
Open -- 12th check, NOT FIXED. 0 SCAs on BC 24686. BC 1797 stale 36 days.
Last checked: 2026-08-01 UTC (5th check today)
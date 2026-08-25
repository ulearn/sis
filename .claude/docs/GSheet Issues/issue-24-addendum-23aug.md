ISSUE 24 -- Alberto Squillace
Reporter: KC | Area: booking | Sheet row 25

SYMPTOM
Migration issue: bereavement holidays from Fidelo. SIS shows 2 BCs (12-week ending Jun 26
+ 9-week starting Jul 20). BC 24686 active 34 days with 0 class assignments.

ROOT CAUSE (89th check, Sun 23 Aug 2026 UTC)
- Booking 1611: CONFIRMED, confirmed = true, fully paid EUR 1,280.12, amountOpen = EUR 0
- BC 1797 (Morning General, Apr 6 to Jun 26 2026): ended Jun 26, active = true -- 58 days stale
  SCA 229: class 12, weeks Apr 6-26 2026 (historical, expired)
- BC 24686 (Morning General, Jul 20 to Sep 18 2026): active, 34 days elapsed, 0 SCAs
- Student on BC 24686 since Jul 20 with no class assigned
- Sep 18 end date = 26 days away

FIX RECIPE (NOT YET RUN)

Step 1 -- Verify state:
  SELECT id, name, start_date, end_date, active FROM booking_course WHERE booking_id = 1611;
  SELECT id, class_id, week_start, week_end FROM student_class_assignments
  WHERE booking_course_id IN (1797, 24686);

Step 2 -- Deactivate stale BC 1797:
  UPDATE booking_course SET active = false WHERE id = 1797;

Step 3 -- Create SCA on BC 24686:
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end, created_at)
  VALUES (
    (SELECT student_id FROM booking WHERE id = 1611),
    12,
    24686,
    '2026-07-20',
    '2026-09-18',
    NOW()
  );
  -- class 12 -- confirm with KC/Paul correct class for Alberto

Step 4 -- HubSpot verification (low priority):
  KC noted no HubSpot deal for BC 24686. Booking fully paid. Ask KC to verify deal.

RISK: bookings / data-hygiene. Reversible. Blast radius: Alberto only.
Urgency: medium -- course ends Sep 18 (26 days); attendance missing since Jul 20 (34 days).

STATUS: OPEN -- Fix NOT RUN
Last checked: 2026-08-23 UTC (89th hourly run)

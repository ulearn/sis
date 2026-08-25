# Issue 24 - Alberto Squillace: BC 24686 active 17 days 0 SCAs (60th check)

Reporter: AC | Area: Booking | Row: 25 | Check: 60th Thu 6 Aug 2026 UTC

## Symptom
Migration issue - holidays in Fidelo around Apr 27 2026. BC 24686 (Jul 20 onward)
has been active 17 days with no class assignment.

## Root cause (60th check Thu 6 Aug UTC)

Student 1052 (Alberto Squillace): visa_status = null

Booking 1611:
- status = CONFIRMED, confirmed = true, fully paid EUR 1280.12
- service_start = 2026-04-06, service_end = 2026-09-18

Booking Course 1797 (Morning General, Apr 6 - Jun 26 2026):
- active = true, 41 DAYS STALE (ended Jun 26)
- 1 class assignment: class 12, week Apr 6-26 (expired ~15 weeks ago)

Booking Course 24686 (Morning General, Jul 20 - Sep 18 2026):
- active = true
- 17 days since start (Jul 20) with 0 class assignments - NEVER ASSIGNED

## Fix recipe (NOT YET RUN)

Step 1 - Deactivate stale BC 1797:
  UPDATE public.booking_courses SET active = false WHERE id = 1797;

Step 2 - Assign BC 24686 to class via SIS admin:
  Classes -> To Be Assigned. Student Alberto Squillace (BC 24686).
  Previously class 12 (Morning General) - verify current level.

Step 3 - Or via DB (replace CLASS_ID):
  INSERT INTO public.student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (24686, <CLASS_ID>, '2026-08-10', '2026-09-18');

Step 4 - Verify:
  SELECT id, active FROM public.booking_courses WHERE id IN (1797, 24686);
  SELECT id, booking_course_id, class_id, week_start::date FROM student_class_assignments
  WHERE booking_course_id = 24686;

## Risk
Bookings/Classes: low-medium, reversible. BC 1797 deactivation: cosmetic (course ended).
Blast radius: 1 student.

## Status
OPEN - fix NOT RUN. Student 17 days into BC 24686 without class assignment.
Last checked: Thu 6 Aug 2026 UTC (60th hourly check)

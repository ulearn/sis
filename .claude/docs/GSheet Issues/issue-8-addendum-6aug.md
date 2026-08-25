# Issue 8 — Stale Booking Courses for Diego, Pedro, Aurora (19th check)

Reporter: Various | Area: Doc Gen / Certs | Row: 9 | Check: 19th Thu 6 Aug 2026 UTC

19th hourly check — all 8 stale booking courses unchanged.

## Root cause

8 booking courses with active = true despite end_date in the past:
- Booking Course 1482 (Academic Year Afternoon): ended 19 Dec 2025, 230 days stale
- Booking Course 1485 (Academic Year Afternoon): ended 19 Dec 2025, 230 days stale
- Booking Course 1602 (Academic Year Morning): ended 19 Dec 2025, 230 days stale
- Booking Course 1483 (Academic Year Afternoon): ended 13 Feb 2026, 174 days stale
- Booking Course 1486 (Academic Year Afternoon): ended 13 Feb 2026, 174 days stale
- Booking Course 1484 (Academic Year Afternoon): ended 5 Jun 2026, 62 days stale
- Booking Course 1487 (Academic Year Afternoon): ended 5 Jun 2026, 62 days stale
- Booking Course 1603 (Academic Year Morning): ended 5 Jun 2026, 62 days stale

## Fix recipe (NOT YET RUN)

Step 1 — Deactivate all 8 stale booking courses:
  UPDATE public.booking_courses SET active = false
  WHERE id IN (1482, 1483, 1484, 1485, 1486, 1487, 1602, 1603)
  AND end_date < NOW();

Step 2 — Verify:
  SELECT id, name, end_date::date, active FROM public.booking_courses
  WHERE id IN (1482, 1483, 1484, 1485, 1486, 1487, 1602, 1603);

## Risk / category

- Category: data-hygiene
- Low risk, reversible
- Blast radius: 3 students (Diego Alves, Pedro De Pauli, Aurora Madril), 8 booking courses

## Status

OPEN — fix NOT RUN. 8 stale booking courses, 230 days max.

Last checked: Thu 6 Aug 2026 UTC (19th hourly check)

# Issue 8 — Stale Booking Courses for Diego, Pedro, Aurora (21st check)

Reporter: Various | Area: Doc Gen / Certs | Row: 9 | Check: 21st Sat 8 Aug 2026 UTC

21st hourly check — all 8 stale booking courses unchanged.

## Root cause

8 booking courses with active = true despite end_date in the past:
- Booking Course 1482 (Academic Year Afternoon): ended 19 Dec 2025, 232 days stale
- Booking Course 1485 (Academic Year Afternoon): ended 19 Dec 2025, 232 days stale
- Booking Course 1602 (Academic Year Morning): ended 19 Dec 2025, 232 days stale
- Booking Course 1483 (Academic Year Afternoon): ended 13 Feb 2026, 176 days stale
- Booking Course 1486 (Academic Year Afternoon): ended 13 Feb 2026, 176 days stale
- Booking Course 1484 (Academic Year Afternoon): ended 5 Jun 2026, 64 days stale
- Booking Course 1487 (Academic Year Afternoon): ended 5 Jun 2026, 64 days stale
- Booking Course 1603 (Academic Year Morning): ended 5 Jun 2026, 64 days stale

## Fix recipe (NOT YET RUN)

  UPDATE public.booking_courses SET active = false
  WHERE id IN (1482, 1483, 1484, 1485, 1486, 1487, 1602, 1603)
  AND end_date < NOW();

Verify:
  SELECT id, name, end_date::date, active FROM public.booking_courses
  WHERE id IN (1482, 1483, 1484, 1485, 1486, 1487, 1602, 1603);

## Risk / category

- Category: data-hygiene | Low risk, reversible
- Blast radius: 3 students (Diego Alves, Pedro De Pauli, Aurora Madril)

## Status

OPEN — fix NOT RUN. 8 stale booking courses, 232 days max.
Last checked: Sat 8 Aug 2026 UTC (21st hourly check)

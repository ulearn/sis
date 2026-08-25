# Issue 45 - Mass Stale Booking Courses (70th check 12 Aug 2026)

Reporter: AC  Area: Renewal students  Sheet row: 47

## Symptom
Renewal students not on arrivals list. Root: 98.9% of active Booking Courses are stale.

## Root Cause (70th check - unchanged)
As of Wed 12 Aug 2026:
- Total active Booking Courses: 24,763
- Stale (end_date < 2026-08-12, active=true): 24,479 (98.9%)
- Currently live (end_date >= today): 284
Fidelo-migration artefact -- courses never deactivated on completion.

## Fix Recipe - NOT YET RUN

Step 1 - Dry run count:
  SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date < CURRENT_DATE;
  Expect ~24479.

Step 2 - Mass deactivate:
  UPDATE booking_courses SET active=false WHERE active=true AND end_date < CURRENT_DATE;

Step 3 - Verify:
  SELECT COUNT(*) FROM booking_courses WHERE active=true;
  Expect ~284.

Step 4 - Spot-check arrivals list, attendance, cert generation.

## Risk
Category: data-hygiene. Reversible. Blast radius: 24,479 rows (all historical).

## Status
Fix NOT RUN. Count unchanged at 24,479 for 70 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC (70th check, run 221)
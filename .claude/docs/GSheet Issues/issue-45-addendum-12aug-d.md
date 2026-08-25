# Issue 45 - Mass Stale Booking Courses (75th check 12 Aug 2026)

Reporter: AC  Area: Renewal students  Sheet row: 47

## Symptom
Renewal students not on arrivals list. 98.9% of active Booking Courses are stale.

## Root Cause (75th check — unchanged)
As of Wed 12 Aug 2026 UTC ~21:00:
- Stale (active = true, end_date < today): 24,479
- Live (active = true, end_date >= today): 283
Fidelo migration artefact — courses never deactivated on completion.

## Fix Recipe — NOT YET RUN

Step 1 — Dry run:
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
  Expect ~24,479.

Step 2 — Mass deactivate:
  UPDATE booking_courses SET active = false WHERE active = true AND end_date < CURRENT_DATE;

Step 3 — Verify:
  SELECT COUNT(*) FROM booking_courses WHERE active = true;
  Expect ~283.

Step 4 — Spot-check arrivals, attendance, cert generation.

## Risk
Category: data-hygiene. Reversible. Blast radius: 24,479 rows (all historical, genuinely ended).

## Status
Fix NOT RUN. Stale count unchanged at 24,479 for 75 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC ~21:00 (75th check)
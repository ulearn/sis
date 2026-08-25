# Issue 45 Addendum 11 Aug 2026-c (63rd check)

Tue 11 Aug 2026 UTC. No change since 62nd check.

## Current State

- Total active Booking Courses: 24,763
- Stale (ended before 2026-08-11): 24,479 (98.9%)
- Current (ending 2026-08-11 or later): 284 (same as prior check)
- Mass deactivation still pending -- not yet run

## Fix Recipe (NOT YET RUN)

Step 1 -- Pre-check count:
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
  Expected: ~24,479

Step 2 -- Mass deactivate:
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE active = true AND end_date < CURRENT_DATE;

Step 3 -- Verify after:
  SELECT COUNT(*) FROM booking_courses WHERE active = true;
  Expected: ~284

Pre-condition: Confirm active=true on stale BCs is not used as a billing sentinel.

## Risk

- Category: data-hygiene | Reversible: yes
- Blast radius: HIGH row count (24,479) but all records provably ended

Status: 24,479 stale unchanged. Awaiting Neil approval. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (63rd check)
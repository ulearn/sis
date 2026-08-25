# Issue 45 Addendum -- Fri 31 Jul 2026 (11th check)
Reporter: AC | Area: Renewal Students | Sheet row: 47

## Status: Unchanged -- 24,449 stale BCs system-wide

## Evidence (live DB, 11th check Fri 31 Jul 2026 UTC)
Total active booking courses ended before today (Jul 31): 24,449 (unchanged from 10th check)
Named recipe subset: 27 booking courses to deactivate -- see prior recipe
Bulk system cleanup: 24,449 records need Neil decision on migration approach

## Fix recipe -- NOT YET RUN

Option A (targeted, safe): Deactivate the 27 named BCs per prior recipe.
  These are the specific students AC reported as missing from arrivals.

Option B (bulk migration): Deactivate all 24,449 stale BCs.
  UPDATE booking_courses SET active = false WHERE end_date < CURRENT_DATE AND active = true;
  Risk: This is a broad operation. Back up first.
  Consider a Prisma migration script with logging.

Risk: data-hygiene -- reversible (active flag). Blast radius: 24,449 records for Option B.
Last checked: Fri 31 Jul 2026 UTC (11th check)
# Issue 50 — Stale BAs + Checkout Code | 16th check Thu 20 Aug 2026 (evening)

Sheet row 52 | Reporter: KC | Area: Booking/Accomm

## Critical correction — prior recipe SQL was wrong

All recipes through issue-50-addendum-20aug-c.md used camelCase table names
(BookingAccommodation, endDate, bedId) which do not exist in Postgres.
Correct table: booking_accommodations, snake_case cols: end_date, active, fee, id, bed_id.
The 61-count in prior checks was from unverified queries. Actual counts below.

## DB-verified state (16th check Thu 20 Aug 2026 evening)

Stale active BAs (end_date < now, all time): 11,194
- 2026 vintage only (end_date >= 2026-01-01): 149  (prior estimate was 61 - wrong SQL)
- Pre-2026 historical legacy:               11,045
- Oldest end_date: 1899-12-31 (migration artefact)

## Fix recipe (NOT YET RUN)

Step 1 - Preview 2026 stale BAs (read only, run first):
  SELECT id, bed_id, end_date, fee, booking_id
  FROM booking_accommodations
  WHERE active = true AND end_date < NOW() AND end_date >= '2026-01-01'
  ORDER BY end_date;

Step 2 - Deactivate 2026 stale BAs with fee confirmed:
  UPDATE booking_accommodations SET active = false
  WHERE active = true
    AND end_date < NOW()
    AND end_date >= '2026-01-01'
    AND fee IS NOT NULL;

Step 3 - Confirm fees on null-fee 2026 BAs, then deactivate individually:
  SELECT id, bed_id, end_date, booking_id
  FROM booking_accommodations
  WHERE active = true AND end_date < NOW() AND end_date >= '2026-01-01' AND fee IS NULL;

Step 4 - Fix checkout query (see issue-50-checkout-double-submit.md):
  Filter: WHERE active = true AND end_date >= week_start_date

Step 5 - Optional: bulk deactivate pre-2026 legacy (low priority, reversible):
  UPDATE booking_accommodations SET active = false
  WHERE active = true AND end_date < '2026-01-01';

Risk: medium - many rows. Run Step 1 preview before any update. Reversible. No hard deadline.
Last checked: Thu 20 Aug 2026 (evening). Status: NOT RUN.
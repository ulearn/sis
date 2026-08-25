# Issue 50 Addendum 21 Aug 2026 (Evening) — Stale BAs + Checkout Error

Reporter: KC | Area: Booking/Accomm | Sheet row: 52

Root cause (19th check, Fri 21 Aug 2026 evening — no change since 18th morning):

Stale active Booking Accommodations:
- 2026 vintage (end_date >= 2026-01-01): 149 — unchanged
- Pre-2026 historical legacy: 11,045 (migration artefacts)
- Total stale: 11,194

Checkout submission error likely caused by 2026 stale BAs inflating the weekly count query.

Fix recipe (NOT YET RUN):

Step 1 — Preview 2026 stale BAs (read only, run first):
  SELECT id, bed_id, end_date, fee, booking_id
  FROM booking_accommodations
  WHERE active = true AND end_date < NOW() AND end_date >= '2026-01-01'
  ORDER BY end_date;

Step 2 — Deactivate 2026 stale BAs where fee is confirmed:
  UPDATE booking_accommodations SET active = false
  WHERE active = true AND end_date < NOW() AND end_date >= '2026-01-01' AND fee IS NOT NULL;

Step 3 — Handle null-fee 2026 BAs individually (confirm fees first):
  SELECT id, bed_id, end_date, booking_id
  FROM booking_accommodations
  WHERE active = true AND end_date < NOW() AND end_date >= '2026-01-01' AND fee IS NULL;

Step 4 — Fix checkout query filter (see issue-50-checkout-double-submit.md):
  Filter: WHERE active = true AND end_date >= week_start_date

Step 5 — Optional: bulk deactivate pre-2026 legacy (low priority, reversible):
  UPDATE booking_accommodations SET active = false
  WHERE active = true AND end_date < '2026-01-01';

Risk: medium — many rows. Run Step 1 preview first. Reversible. No hard deadline.
Status: NOT RUN. Last checked: 2026-08-21 Fri evening (19th check)

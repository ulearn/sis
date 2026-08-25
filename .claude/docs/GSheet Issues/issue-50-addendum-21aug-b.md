# Issue 50 Addendum 21 Aug 2026 (Very Late Evening) — Stale Booking Accommodations

Reporter: KC | Area: Booking / Accomm | Sheet row: 52

Symptom: Checkout confirmation emails include both current-week and previous-week checkouts.

Root cause (20th check, Fri 21 Aug 2026 very late evening — no change since 19th):
- 149 active Booking Accommodations with end_date before 21 Aug 2026 (all 2026, from Jan 3 onwards).
- Oldest stale: BA 10079 (booking 1120), ended 3 Jan 2026; BA 10653 (booking 569), ended 3 Jan 2026.
- The checkout query appears to include all active BAs regardless of end_date, pulling in historical stale records.
- Total BAs including pre-2026 legacy: approx 11,194. The 149 are 2026-year BAs only.

Fix recipe (NOT YET RUN — requires Neil review of checkout query logic first):

Step 1 — Preview stale BAs (READ-ONLY):
  SELECT id, booking_id, start_date, end_date FROM booking_accommodations
  WHERE active = true AND end_date < CURRENT_DATE AND end_date >= '2026-01-01'
  ORDER BY end_date ASC;

Step 2 — Deactivate the stale 2026 BAs:
  UPDATE booking_accommodations SET active = false, updated_at = NOW()
  WHERE active = true AND end_date < CURRENT_DATE AND end_date >= '2026-01-01';

Step 3 — Investigate and fix checkout query to filter active BAs by current end_date.

Verify:
  SELECT COUNT(*) FROM booking_accommodations
  WHERE active = true AND end_date < CURRENT_DATE AND end_date >= '2026-01-01';
  Expect: 0

Risk: bookings/accomm | Reversible: yes | Blast radius: 149 BAs, checkout email filtering
Status: Fix NOT RUN.
Last checked: 2026-08-21 Fri very late evening (20th check)
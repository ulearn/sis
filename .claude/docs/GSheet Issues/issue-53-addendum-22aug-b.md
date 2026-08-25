# Issue 53 Addendum 22 Aug 2026 (b) — Fanny Scelles BA 11399 Fee Null

Sheet row: 55 | Student: 14451 (Fanny Scelles)

Root cause (6th check today):
- Fanny Scelles arrives 29 Aug 2026 — 7 DAYS from today.
- BA 11267 (bed 23, booking 17843): Aug 29 to Oct 4, fee EUR 3,840, active = true — OK.
- BA 11399 (bed 54, booking 17843): Oct 4 to Dec 19, active = true, fee = null — fee not set. Last updated 17 Aug.
- 6th alert today. Fix not run.

Fix recipe (NOT YET RUN):

Step 1 — Look up weekly rate for bed 54. Oct 4 to Dec 19 = 11 weeks.

Step 2 — Set fee:
  UPDATE booking_accommodation SET fee = <amount> WHERE id = 11399;

Step 3 — Verify:
  SELECT id, bed_id, start_date, end_date, fee, active
  FROM booking_accommodation WHERE id IN (11267, 11399);

Risk: Accommodations / data-hygiene. Reversible. Single booking 17843. Guest arrives 29 Aug (7 days).
Status: OPEN — fix not run.
Last checked: Sat 22 Aug 2026 UTC (6th check today)

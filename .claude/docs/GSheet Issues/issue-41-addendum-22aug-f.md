# Issue 41 Addendum 22 Aug 2026 (f) — BA 11396 Checkout Passed / BA 11397 Fee Null

Sheet row: 43 | Student: 14571 (Giampaolo Russo) | Booking: 18180

Root cause (453rd check, 8th today):
- BA 11357 (bed 178): Aug 2–15, fee EUR 1,250, active = true — 7 days stale.
- BA 11396 (bed 44): Aug 15–22 Aug, active = true, fee = null — end date passed midnight UTC, not deactivated.
- BA 11397 (bed 89): 22 Aug to 6 Sep, active = true, fee = null — new occupancy starts today, fee not set.
- Booking 18180: CONFIRMED, fully paid EUR 2,584.96. Fix not run (8th alert today, 453rd overall).

Fix recipe (NOT YET RUN):

Step 1 — Deactivate stale BAs:
  UPDATE booking_accommodation SET active = false WHERE id IN (11357, 11396);

Step 2 — Set fees (look up weekly rates for beds 44 and 89):
  UPDATE booking_accommodation SET fee = <amount_bed44> WHERE id = 11396;
  UPDATE booking_accommodation SET fee = <amount_bed89> WHERE id = 11397;

Step 3 — Verify:
  SELECT id, bed_id, start_date, end_date, fee, active
  FROM booking_accommodation WHERE id IN (11357, 11396, 11397);

Risk: Accommodations / data-hygiene. Reversible. Single booking 18180.
Status: OPEN — fix not run.
Last checked: Sat 22 Aug 2026 UTC (453rd check, 8th today)

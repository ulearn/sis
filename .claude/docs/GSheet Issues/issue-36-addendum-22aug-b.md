# Issue 36 Addendum 22 Aug 2026 (b) — BA 11311 Checkout Passed / BA 11393 Fee Null

Sheet row: 38 | Area: Accommodation

Root cause (453rd check, 8th today):
- BA 11311 (bed 84, booking 17980): Jun 28 to 22 Aug, fee EUR 3,850, active = true — end date passed midnight UTC, not deactivated.
- BA 11393 (bed 88, booking 17980): 22 Aug to 13 Sep, active = true, fee = null — new occupancy started today, fee not set.
- Booking 17980: CONFIRMED. Both BAs share the same booking. Fix not run (8th alert today).

Fix recipe (NOT YET RUN):

Step 1 — Deactivate BA 11311:
  UPDATE booking_accommodation SET active = false WHERE id = 11311;

Step 2 — Set fee on BA 11393 (look up weekly rate for bed 88):
  UPDATE booking_accommodation SET fee = <amount> WHERE id = 11393;

Step 3 — Verify:
  SELECT id, bed_id, start_date, end_date, fee, active
  FROM booking_accommodation WHERE id IN (11311, 11393);

Risk: Accommodations / data-hygiene. Reversible. Single booking 17980.
Status: OPEN — fix not run.
Last checked: Sat 22 Aug 2026 UTC (453rd check, 8th today)

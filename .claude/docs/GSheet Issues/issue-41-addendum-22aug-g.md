# Issue 41 Addendum 22 Aug 2026 (g) — BA 11392 Confirmed (Capel Sep 6-14 EUR 415); BAs 11396/11397 Still Fee=null

Sheet row: 43 | Student: 14571 (Giampaolo Russo) | Booking: 18180

## Root cause (461st check, 9th today — Sat 22 Aug 2026 UTC)

Fresh DB read:
- BA 11357 (bed 178, host family): Aug 2 to Aug 15, fee EUR 1,250, active = true — 7 days past end, not deactivated.
- BA 11396 (bed 44): Aug 15 to Aug 22, fee = null, active = true — end date passed midnight UTC today, not deactivated, fee never set.
- BA 11397 (bed 89): Aug 22 to Sep 6, fee = null, active = true — started today, fee still unset.
- BA 11392 (bed 168, Capel premium room): Sep 6 to Sep 14, fee = EUR 415, active = true — upcoming; bed 168 and fee EUR 415 already set.
- Booking 18180: CONFIRMED, confirmed = true, amountPaid = EUR 2,584.96 (fully paid).

NEW since recipe (f): BA 11392 confirmed with bed 168 and fee EUR 415 already correct.
Outstanding: deactivate 11357+11396, set fee on 11397.

## Fix recipe (NOT YET RUN)

Step 1 - Deactivate stale BAs (11357 ended Aug 15, 11396 ended Aug 22):
  UPDATE booking_accommodation SET active = false WHERE id IN (11357, 11396);

Step 2 - Set fee on BA 11397 (bed 89, Aug 22-Sep 6). Confirm weekly rate for bed 89, then:
  UPDATE booking_accommodation SET fee = <rate_bed89> WHERE id = 11397;

Step 3 - Verify:
  SELECT id, bed_id, start_date, end_date, fee, active
  FROM booking_accommodation WHERE id IN (11357, 11392, 11396, 11397) ORDER BY start_date;

Expected: 11357 active=false, 11396 active=false, 11397 active=true+fee set, 11392 active=true fee=415.

## Risk
Category: bookings + money. Reversible. Blast radius: 4 BAs on booking 18180.

## Status
OPEN — fix NOT YET RUN. BA 11392 already correct.
Last checked: Sat 22 Aug 2026 UTC (461st, 9th today)
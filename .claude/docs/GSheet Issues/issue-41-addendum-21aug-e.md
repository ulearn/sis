# Issue 41 addendum 21 Aug check 160
Reporter: KC | Sheet row 43 | Student: Giampaolo Russo (14571)

Current state verified Fri 21 Aug 2026 ~12:00 UTC:
- BA 11357: bed 178, ended 2026-08-15, fee=1250, active=true (6d stale)
- BA 11394: bed 89, booking 17826, ended 2026-08-09, fee=NULL, active=true (12d stale)
- BA 11396: bed 44, booking 18180, ends 2026-08-22, fee=NULL, active=true (CRITICAL: checkout ~12h)
- BA 11397: bed 89, booking 18180, starts 2026-08-22 to 2026-09-06, fee=NULL (CRITICAL: checkin ~12h)
- Booking 18180: CONFIRMED, amountTotal=2584.96, amountOpen=0
- Fee split: BA 11396 = EUR 306.65 (1 wk), BA 11397 = EUR 613.31 (2 wks)
  Check: 1250+306.65+613.31=2169.96 vs total 2584.96 — gap EUR 415, Neil to verify
- No change since check 159 (11:02 UTC). Fix NOT RUN.

Fix recipe (NOT YET RUN):
  UPDATE booking_accommodation SET fee = 306.65 WHERE id = 11396;
  UPDATE booking_accommodation SET fee = 613.31 WHERE id = 11397;
  Verify EUR 415 gap with Neil before setting fees.
  After Sat 22 checkout: UPDATE booking_accommodation SET active = false WHERE id IN (11357, 11394);
  Note: BA 11394 belongs to booking 17826 — confirm deactivation is intended.

Risk: Bookings/Money. Reversible. Blast radius: bookings 18180+17826, student 14571.
Status: OPEN, Fix NOT RUN. Last checked: 2026-08-21 12:00 UTC (check 160)
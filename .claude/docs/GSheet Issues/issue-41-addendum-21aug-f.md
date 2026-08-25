Issue 41 addendum - Giampaolo Russo - Fri 21 Aug 2026 19:00 UTC
Symptom: Host family + Capel apartment; second accommodation missing from SIS matching.
Booking 18180: CONFIRMED, fully paid EUR 2,584.96
BA 11357 (bed 178): ended Aug 15, fee EUR 1,250, active, 6 days stale.
BA 11396 (bed 44): ends Sat 22 Aug, fee null, active - CHECKOUT TOMORROW, fee NOT SET.
BA 11397 (bed 89): starts Sat 22 Aug to Sep 6, fee null, active - CHECKIN TOMORROW, fee NOT SET.
BA 11392 (bed 168): Sep 6 to Sep 14, fee EUR 415, active - confirmed in database (Capel apartment, previously unlisted in CAUSE).
BA 11394 (bed 89, booking 17826): ended Aug 9, fee null, active, 12 days stale (different booking).
Fee reconciliation: EUR 1,250 + EUR 415 = EUR 1,665 accounted.
Remaining EUR 919.96 split 7:15 nights: BA 11396 = EUR 306.65, BA 11397 = EUR 613.31.
CRITICAL: Sat 22 Aug < 17 hours away.
Fix NOT YET RUN:
  UPDATE BookingAccommodation SET fee = 306.65 WHERE id = 11396
  UPDATE BookingAccommodation SET fee = 613.31 WHERE id = 11397
  UPDATE BookingAccommodation SET active = false WHERE id IN (11357, 11394)
Risk: Bookings/Money, reversible, two bookings (18180, 17826).
Last checked: Fri 21 Aug 2026 ~19:00 UTC
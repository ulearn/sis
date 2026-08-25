Issue 50 -- Checkout double-submit (8th check, Wed 19 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 52

Symptom: Submitting current-week checkouts also queues prior-week BAs.

Root cause (updated 19 Aug 2026 2nd run)
Ten stale-active BAs confirmed as of 19 Aug 2026 (ended, active=true, cleanCheckoutAt=null):

Week ending 9 Aug (10 days stale -- previously untracked):
- BA 11361: booking 18190, ended 9 Aug, fee EUR 750
- BA 11179: booking 82, ended 9 Aug, fee EUR 1,360
- BA 11277: booking 17890, ended 9 Aug, fee EUR 3,360
- BA 11355: booking 18175, ended 9 Aug, fee EUR 1,360
- BA 11394: booking 17826, ended 9 Aug, fee = null

Week ending 15 Aug (4 days stale):
- BA 27: bed 59, booking 17853, 1 Aug to 15 Aug
- BA 11230: bed null (unclaimed), booking 32, 4 Jul to 15 Aug
- BA 11357: bed 178, booking 18180 (Giampaolo Russo), 2 Aug to 15 Aug -- also Issue 41

Week ending 16 Aug (3 days stale):
- BA 11286: bed 87, Vincenzo Pio Di Costanzo (booking 17911), 24 May to 16 Aug, fee EUR 2,520
- BA 11371: bed 157, Luana Salzano (booking 18188), 8 Aug to 16 Aug, fee = null

Fix recipe (NOT YET RUN)

Step 1: Verify all checkouts completed for the 10 stale BAs with KC/Paul before deactivating.

Step 2: Deactivate all 10 stale BAs:
  UPDATE booking_accommodation SET active = false, updated_at = NOW()
  WHERE id IN (11361, 11179, 11277, 11355, 11394, 27, 11230, 11357, 11286, 11371);
  Note: BA 11357 overlaps Issue 41 -- coordinate with that fix.

Step 3: Code fix -- restrict checkout window to this_monday (not last_monday) in checkout endpoint.

Risk: accommodation + code. Reversible (can re-activate BAs if checkout wasn't confirmed).
Status: OPEN -- Fix NOT RUN | Last checked: Wed 19 Aug 2026 UTC (8th check)

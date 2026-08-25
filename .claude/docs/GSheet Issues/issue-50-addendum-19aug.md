Issue 50 -- Checkout double-submit (7th check, Wed 19 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 52

Symptom: Submitting current-week checkouts also queues prior-week BAs.

Root cause (verified)
Five stale-active BAs as of 19 Aug 2026 (ended, active=true, cleanCheckoutAt=null):

Week ending 15 Aug (4 days stale):
- BA 27: bed 59, booking 17853, 1 Aug to 15 Aug
- BA 11230: bed null (unclaimed), booking 32, 4 Jul to 15 Aug
- BA 11357: bed 178, booking 18180 (Giampaolo Russo), 2 Aug to 15 Aug -- also Issue 41

Week ending 16 Aug (3 days stale -- NEW since 18 Aug check):
- BA 11286: bed 87, Vincenzo Pio Di Costanzo (booking 17911), City Centre Apartment, 24 May to 16 Aug, fee EUR 2520
- BA 11371: bed 157, Luana Salzano (booking 18188), Apartment, 8 Aug to 16 Aug, fee = null

Fix recipe (NOT YET RUN)
Step 1: Verify checkouts completed for all 5 BAs with KC/Paul.
Step 2: Deactivate 5 stale BAs:
  UPDATE booking_accommodations SET active = false, updated_at = NOW()
  WHERE id IN (27, 11230, 11357, 11286, 11371);
Step 3: Code fix -- restrict checkout window to this_monday (not last_monday) in checkout endpoint.

Risk: accommodation + code. Reversible. BA 11357 overlaps Issue 41.
Status: OPEN -- Fix NOT RUN | Last checked: Wed 19 Aug 2026 UTC
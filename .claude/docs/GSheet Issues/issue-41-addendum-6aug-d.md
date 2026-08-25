# Issue 41 — Giampaolo Russo: Dual Accommodation (18th check, Thu 6 Aug 2026)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

## Root cause (18th check — unchanged)

BA 11357 (Host Family, bed 178, Claremont Close, 2 Aug - 6 Sep 2026):
  active=true, bedId=178 — student checked in 4 days ago (2 Aug). OK.

BA 11392 (City Centre Apartment, 6 Sep - 14 Sep 2026):
  bedId = null — still unassigned. Check-in: 6 Sep 2026 (31 days). Fee: EUR 415.

Payment 17954 (EUR 2,584.96, Bank, 26 Jun 2026):
  xeroPaymentId = null — 41 days unreconciled. bookingId = 18180.

## Fix recipe (NOT YET RUN)

Step 1 - Assign Capel bed to BA 11392:
SIS admin > Accommodation > City Centre: find BA 11392 (booking 18180, Giampaolo Russo)
and assign available bed for 6 Sep - 14 Sep 2026.
If UI blocked:
  UPDATE booking_accommodations SET bed_id = BED_ID WHERE id = 11392;
  (Replace BED_ID with actual available bed ID)

Step 2 - Reconcile payment 17954 in Xero:
Find EUR 2,584.96 bank import ~26 Jun 2026, match to booking 18180.
Then update SIS:
  UPDATE payments SET xero_payment_id = XERO_REF WHERE id = 17954;

## Risk
Category: bookings / accommodation / accounts; reversible; Sep 6 deadline gives 31 days

## Status
Host family active (checked in 2 Aug). Capel BA 11392 bedId still null. Payment 41d. Fix NOT RUN.
Last checked: Thu 6 Aug 2026 UTC (18th check)
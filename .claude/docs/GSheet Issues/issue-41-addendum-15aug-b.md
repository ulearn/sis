Issue 41 - Giampaolo Russo (Student 14571) - Addendum 15 Aug 2026 (b)

Reporter: Diego | Area: Booking / Accommodation | Sheet row: 43

SYMPTOM
Host family + three Capel Street blocks; fees missing on BAs 11396 and 11397; BA 11392 has no bed assigned.

CURRENT STATE (85th check - Sat 15 Aug 2026 ~10:10 UTC)

Booking 18180: CONFIRMED, confirmed = true, amountPaid = EUR 2,584.96, amountOpen = 0

Booking Accommodations:
  BA 11357: bed 178 (host family), Aug 2-Aug 15, fee EUR 1,250, active - ENDED TODAY, not deactivated
  BA 11396: bed 44 (Capel wk1), Aug 15-Aug 22, fee = NULL, active - URGENT, student resident today
  BA 11397: bed 89 (Capel wk2-4), Aug 22-Sep 6, fee = NULL, active - check-in in 7 days
  BA 11392: bedId = null (unassigned), Sep 6-Sep 14, fee EUR 415, active - no bed, 22 days away

Payment 17954: EUR 2,584.96, Bank, Jun 26 2026, xeroPaymentId = null - 51 days unreconciled

FIX RECIPE (NOT YET RUN)

1. Set fee on BA 11396 - URGENT (student resident today)
   SIS admin > Booking 18180 > Accommodation > BA 11396 (bed 44, Aug 15-22)
   Set fee = EUR 625 (confirm with Diego; ref: EUR 1,250 / 13 nights x 7 nights)
   Save

2. Deactivate BA 11357 (ended today, safe)
   SIS admin > BA 11357 > active = false > Save
   SQL: UPDATE BookingAccommodation SET active = false WHERE id = 11357; -- NOT YET RUN

3. Set fee on BA 11397 (before Aug 22)
   SIS admin > BA 11397 (bed 89, Aug 22-Sep 6)
   Set fee = EUR 1,295 (confirm with Diego)
   Save

4. Assign bed to BA 11392 (before Sep 6)
   Accommodation matching > find available City Centre apt Sep 6-14 > assign to BA 11392

5. Reconcile Payment 17954 in Xero
   Xero > Jun 26 2026 bank receipt EUR 2,584.96 > match to Booking 18180 invoice

RISK / CATEGORY
Accommodation / accounts - reversible - single student blast radius.
Fee on BA 11396 is urgent (accounts today). All other steps low-risk.

STATUS
OPEN - 85th check 2026-08-15 ~10:10 UTC. Fix NOT RUN.

# Issue 36 (row 38) -- Pietro / Stale Booking Accommodations -- PM Addendum 27 Jul 2026

Reporter: KC | Area: Booking/Accomm | Sheet row: 38 | Last checked: 2026-07-27 UTC PM

## Root Cause (fresh data 2026-07-27 PM)

Stale BA count: 47 (up from 46 -- 1 new stale BA since AM run).

Oldest stale BAs:
- BA 11183: bed 89, ended 2026-03-06 (143 days)
- BA 11185: bed 182, ended 2026-05-03 (85 days)
- BA 9905: bed 47, ended 2026-05-03 (85 days)
- BA 11229: bed 89, ended 2026-05-09 (79 days)
- BA 11216: bed 66, ended 2026-05-09 (79 days)

Pietro BA 11311: bed 84, Jun 28 - Sep 13 2026, active, fee EUR 3,850 -- NOT stale (correct).
Pietro payment 17733: EUR 5,331, Bank, xeroPaymentId=null, booking 17980, 54 days old.

## Fix Recipe (NOT YET RUN)

Step 1: Deactivate 47 stale BAs
UPDATE "BookingAccommodation" SET active=false WHERE active=true AND "endDate"<'2026-07-27' AND "bedId" IS NOT NULL;

Step 2: Reconcile Pietro payment 17733 in Xero
Find bank receipt in Xero, apply to booking 17980.
UPDATE "Payment" SET "xeroPaymentId"='<XERO_ID>' WHERE id=17733;

Risk: data-hygiene + accounts. Reversible: yes. Blast radius: low.
Last checked: 2026-07-27 UTC PM
# Issue 41 — Giampaolo Russo Dual Accommodation (15th check)
Reporter: Diego | Area: Booking / Accomm | Sheet row: 43 | Checked: Thu 6 Aug 2026 UTC

## Symptom
Student booked Host Family + Capel Street City Centre Apartment. Capel booking accommodation exists in DB but no bed assigned. Payment not reconciled in Xero.

## Root Cause — live data Thu 6 Aug 2026 UTC (unchanged from 14th check)

Booking 18180 (Giampaolo Russo, student 14571):
- CONFIRMED, confirmed = true, amountPaid = EUR 2,584.96, amountOpen = EUR 0 — fully paid

Accommodations:
- Booking accommodation 11357: bed 178 (Host Family, Claremont Close), 2 Aug to 6 Sep 2026, active = true, fee = EUR 1,250 — current stay, OK
- Booking accommodation 11392: bedId = null (City Centre Apartment), 6 Sep to 14 Sep 2026, active = true, fee = EUR 415 — no bed assigned; 31 days until check-in

Payment:
- Payment 17954: EUR 2,584.96, Bank, created 29 Jun 2026, xeroPaymentId = null — 38 days unreconciled

## Fix Recipe (NOT YET RUN)

Step 1 — Assign bed to booking accommodation 11392:
  Via SIS admin Accommodation page, find booking 18180 / Giampaolo Russo, assign a Capel Street bed to BA 11392.
  Or directly (confirm correct bed ID from Capel bed list first):
    UPDATE "BookingAccommodation" SET "bedId" = <CAPEL_BED_ID> WHERE id = 11392;

Step 2 — Reconcile payment 17954 in Xero:
  Find the EUR 2,584.96 bank receipt dated around 26 Jun 2026 for booking 18180.
  Match in Xero, then: UPDATE "Payment" SET "xeroPaymentId" = '<XERO_ID>' WHERE id = 17954;

## Risk / Category
bookings / money — reversible. Blast radius: 1 booking, 1 accommodation record, 1 payment.

## Status
Open — booking accommodation 11392 bedId still null (Sep 6 check-in 31 days away); payment 17954 Xero unreconciled 38 days.
Last checked: Thu 6 Aug 2026 UTC (15th hourly run)
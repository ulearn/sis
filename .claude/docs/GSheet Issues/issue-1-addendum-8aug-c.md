# Issue 1 Addendum 8 Aug 2026-c

**Check:** 188th (Sat 8 Aug 2026 UTC) **Sheet row:** 2

## Root Cause

Orphan payments (booking_id=null, all xeroPaymentId=null):
- Payment 4781: EUR 380 Flywire 20 Aug 2019 (~2546d legacy Fidelo)
- Payment 16988: EUR 339.90 Bank 28 Apr 2026 (102d)
- Payment 16989: EUR 339.90 Bank 28 Apr 2026 (102d)
- Payment 17187: EUR 6151 TransferMate Escrow 1 May 2026 (99d)

Bookings (amount_paid set directly on booking row, 0 linked payment records):
- Booking 17856 (Margherita Galbusera): CONFIRMED confirmed=false amount_paid=339.90 amount_open=null 0 payments
- Booking 17857 (Francesca Fassina): CONFIRMED confirmed=false amount_paid=339.90 amount_open=null 0 payments

Stale BCs (both ended 10 Jul 2026, active=true, 29d stale):
- BC 24630 (GE AM Plus)
- BC 24631 (GE AM Plus)

## Fix (NOT YET RUN)

Step 1: UPDATE payments SET booking_id=17856 WHERE id=16988;
Step 2: UPDATE payments SET booking_id=17857 WHERE id=16989;
Step 3: UPDATE bookings SET confirmed=true, amount_open=0 WHERE id IN (17856, 17857);
Step 4: UPDATE booking_courses SET active=false WHERE id IN (24630, 24631);
Step 5: Payment 17187 EUR 6151 - identify booking before linking. Do NOT link until confirmed.
Step 6: Payment 4781 EUR 380 Flywire 2019 - legacy, low priority, check Xero/Fidelo.

## Risk
Money/bookings. Steps 1-4 low blast radius reversible. Step 5 EUR 6151 do not guess.

## Status
Open NOT YET RUN (102d for pmts 16988/16989)

## Last Checked
Sat 8 Aug 2026 UTC (188th check)

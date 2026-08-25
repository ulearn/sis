# Issue 36b ## Pietro Caccianiga BA 11393 (190th check)
Reporter: ST | Area: Booking/Accomm | Sheet row 38 | Fri 14 Aug 2026 UTC

## Root cause
- BA 11393: bed 88, startDate 2026-08-22, endDate 2026-09-13, fee = null, active = true
- Check-in: 8 days (2026-08-22)
- Payment 17733: EUR 5331, xeroPaymentId = null (72 days since 2026-06-03)

## Fix recipe (NOT YET RUN)
1. Confirm accommodation fee with Diego for BA 11393 (bed 88, Aug 22 to Sep 13)
2. UPDATE booking_accommodation SET fee = AMOUNT, updatedAt = NOW() WHERE id = 11393;
3. Reconcile Payment 17733 in Xero (EUR 5331, booking 17980)

Risk: money/bookings | Reversible: yes | Blast radius: single student
Status: Open - fix NOT RUN. Check-in Aug 22 (8 days). Last checked: 2026-08-14 UTC (190th)
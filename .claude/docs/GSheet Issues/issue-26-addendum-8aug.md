Issue 26 addendum 56th check Sat 8 Aug 2026 UTC

Reporter: PG | Area: Booking / Payments | Sheet row: 27

CORRECTION from previous checks (incl. issue-26-addendum-6aug-b.md):
- BC 23 belongs to booking 22 (student 18, Ivan Rodriguez Solares) -- NOT booking 18034
- BC 24826 belongs to booking 18034 (student 14532, Ernesto Pesoa Gil) -- NOT Ivan Rodriguez
- Previous recipe incorrectly listed student 145 for booking 18034; correct student is 14532

State (unchanged from prior checks):
- Booking Course 23 (Intensive General 30, ended 22 May 2026): active=true -- 78 days stale, bookingId=22
- Booking 22 (Ivan Rodriguez Solares, student 18): CONFIRMED, EUR 1,948 paid -- no financial issue; BC 23 is a stale flag only
- Booking Course 24826 (2 weeks Intensive General 30, ended 19 Jun 2026): active=true -- 50 days stale, bookingId=18034
- Booking 18034 (Ernesto Pesoa Gil, student 14532): PARTIAL, confirmed=false, EUR 845 paid of EUR 1,095, EUR 250 open
- Payment 17683: EUR 845, Bank Transfer, 23 Apr 2026, xeroPaymentId=null (no transactionId) -- 107 days unreconciled

Fix Recipe (NOT YET RUN):
1. Deactivate stale BCs: UPDATE booking_course SET active=false, updated_at=NOW() WHERE id IN (23, 24826);
2. Chase EUR 250 on booking 18034 (Ernesto Pesoa Gil, student 14532) -- check HubSpot.
3. Once EUR 250 received: record payment, set booking 18034 confirmed=true.
4. Reconcile payment 17683 (EUR 845, Bank, 23 Apr 2026) in Xero -- xeroPaymentId is null.

Risk: bookings / payments / Xero. Reversible. Blast radius: bookings 22 + 18034, students 18 + 14532.
Status: OPEN -- fix NOT applied. Last checked: Sat 8 Aug 2026 UTC (56th check).
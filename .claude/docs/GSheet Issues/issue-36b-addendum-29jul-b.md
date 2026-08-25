Issue 36b -- Pietro Caccianiga Stale Accommodation Bookings (Addendum Wed 29 Jul 2026 -- 127th check)

Reporter: KC | Area: Booking / Accomm | Sheet row: 38

STATUS: 46 stale accommodation bookings unchanged. Pietro payment 17733 xeroPaymentId still null (57 days).

EVIDENCE (live DB, Wed 29 Jul 2026):

Stale BAs (active=true, ended before today, endDate >= 2020-01-01, bedId not null): 46
Oldest stale: BA 11183, ended 2026-03-06, bedId=89, fee=2400

Pietro payment 17733: amount=5331, xeroPaymentId=null, bookingId=17980, paymentDate=2026-06-02
  57 days without Xero reconciliation (was 56 days in last check)

FIX RECIPE (NOT YET RUN):

See base recipe: issue-36b-pietro-accomm-dates.md
See prior addendum: issue-36b-addendum-29jul.md

Step 1: Deactivate 46 stale BAs in bulk
  NOT YET RUN - update BookingAccommodation set active=false
  where active=true and endDate < 2026-07-29 and endDate >= 2020-01-01 and bedId is not null
  (verify count first: should return 46)

Step 2: Reconcile Pietro payment 17733 in Xero
  Match to invoice for booking 17980 (Pietro Caccianiga, EUR 5331)
  Then update xeroPaymentId in SIS payment record 17733

RISK: bookings + money - reversible (reactivate BAs if needed; Xero reconciliation is standard)

Status: OPEN - Fix NOT Run
Last checked: Wed 29 Jul 2026 UTC
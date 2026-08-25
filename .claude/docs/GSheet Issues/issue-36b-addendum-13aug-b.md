Issue 36b -- Pietro Caccianiga / BA 11393 (Thu 13 Aug 2026)

Reporter: Diego | Area: Booking/Accomm | Sheet row: 38
181st check -- Thu 13 Aug 2026 ~16:04 UTC

Symptom:
Accommodation booking fee missing; payment unreconciled in Xero. Check-in 9 days away (Aug 22).

Root Cause (evidence):
- Booking Accommodation 11393: bedId=88, startDate=2026-08-22, endDate=2026-09-13, fee=null, active=true
- Payment 17733: amount=EUR 5,331, xeroPaymentId=null, paymentDate=2026-06-02, dataSource=HUBSPOT
  73 days without Xero reconciliation as of this check
- No change since 180th check

Fix Recipe (NOT YET RUN):

Step 1: Ask Diego what the correct accommodation fee is for BA 11393 (Aug 22-Sep 13 period).

Step 2: In SIS Admin: Set fee on Booking Accommodation 11393.
  UPDATE booking_accommodations SET fee = <confirmed_amount> WHERE id = 11393;  -- NOT YET RUN

Step 3: Reconcile Payment 17733 (EUR 5,331) in Xero against the correct invoice.

Risk: money/bookings | Reversible: yes | Blast radius: 1 student, 1 accommodation booking
Check-in: Aug 22 2026 (9 days away)

Status: OPEN -- URGENT. Fee null, Xero unreconciled. Check-in imminent.
Last checked: Thu 13 Aug 2026 ~16:04 UTC
Previous recipe: issue-36b-addendum-13aug.md
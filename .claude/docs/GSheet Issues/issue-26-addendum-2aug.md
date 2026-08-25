# Issue 26 — Ivan Rodriguez: Stale BCs + EUR 250 Open (Addendum 2 Aug 2026, check #47)
Sheet row: 27 | Reporter: AC | Area: booking / class

UNCHANGED (47th hourly check Sun 2 Aug 2026 UTC, 6th today):
- BC 23 (Intensive General 30, booking 22): endDate 2026-05-22, active=true — 72 days stale
- BC 24826 (2 weeks Intensive General 30, booking 18034): endDate 2026-06-19, active=true — 44 days stale
- Booking 18034 (student 14532): PARTIAL, confirmed=false, amountTotal=1095, amountPaid=845, amountOpen=250
- Payment 17683: EUR 845, Bank, 2026-04-23, bookingId=18034, xeroPaymentId=null — 101 days without Xero link

Fix recipe (NOT YET RUN):
Step 1: UPDATE BookingCourse SET active=false WHERE id IN (23, 24826);
Step 2: Chase EUR 250 via HubSpot for student 14532 (booking 18034); link payment when received.
Step 3: Find EUR 845 bank receipt 23 Apr 2026 in Xero; match to booking 18034; set xeroPaymentId on payment 17683.

Risk: Bookings + Money — EUR 250 open + Xero gap. Reversible. Blast: 1 booking, 2 booking courses, 1 payment.
Status: OPEN — fix NOT RUN. Last checked: Sun 2 Aug 2026 UTC

# Issue 26 — Ivan Rodriguez: Stale BCs + EUR 250 Open (Addendum 31 Jul 2026, check #45)
Sheet row: 27 | Reporter: AC | Area: booking / class

UNCHANGED (45th hourly check Fri 31 Jul UTC):
- BC 23 (Intensive General 30, bk22): endDate 2026-05-22, active=true — 70d stale
- BC 24826 (2wk Intensive General 30, bk18034): endDate 2026-06-19, active=true — 42d stale
- Booking 18034 (student 14532): PARTIAL, confirmed=false, amountTotal=1095, amountPaid=845, amountOpen=250
- Payment 17683: EUR 845, Bank, 2026-04-23, bookingId=18034, xeroPaymentId=null — 99d without Xero link

Fix recipe (NOT YET RUN):
Step 1: UPDATE BookingCourse SET active=false WHERE id IN (23, 24826);
Step 2: Chase EUR 250 via HubSpot for student 14532; link payment when received.
Step 3: Find EUR 845 bank receipt 23 Apr 2026 in Xero; match to bk18034; set xeroPaymentId on pmt 17683.

Risk: Bookings + Money — EUR 250 open + Xero gap. Reversible. Blast: 1 booking, 2 BCs, 1 payment.
Status: OPEN — fix NOT RUN. Last checked: Fri 31 Jul 2026 UTC

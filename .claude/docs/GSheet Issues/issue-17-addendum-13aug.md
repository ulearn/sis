Issue 17 Addendum 13 Aug 2026 (32nd check) -- EUR 1,530 on Cancelled Booking

Reporter: Unknown  Area: Booking / Accounts  Sheet row: 18

Symptom
Booking 1308 is CANCELLED but EUR 1,530 was paid.

Root cause (32nd check -- Thu 13 Aug UTC)
- Booking 1308: student 766 (Ana Jessica Rosa de Paula Santos), status = CANCELLED, confirmed = false
- EUR 1,530 paid (EUR 1,280 + EUR 250), amount_open = null
- Booking last updated 2026-06-07 -- 67 days ago, no change since
- No other bookings for student 766 -- EUR 1,530 stranded on cancelled booking
- Payment 17186: EUR 1,280, Bank Transfer, transactionId D2026101, 2026-05-05 -- Xero unconfirmed (100 days)
- Payment 17050: EUR 250, Bank Transfer, transactionId D2026101, 2026-05-05 -- Xero unconfirmed (100 days)
- Both payments share transactionId D2026101 -- possible data entry error

Three scenarios
1. Refund issued externally, not in SIS -- check Xero/bank for D2026101 outgoing payment
2. Student re-enrolled -- new booking should absorb EUR 1,530
3. Booking 1308 cancelled in error -- reinstate it

Fix recipe (NOT YET RUN)
Step 1 -- Check Xero/bank for refund against D2026101 (Hub fins/ or Xero MCP)
Step 2 -- If refund confirmed: record in SIS payments and close balance
Step 3 -- If no refund: reinstate booking 1308 or create new booking for re-enrolment
Step 4 -- Reconcile payments 17186 and 17050 in Xero (100 days unconfirmed)

Risk: money. Reversible with care. Blast: 1 student, EUR 1,530.

Status: open -- fix NOT RUN. 32 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC
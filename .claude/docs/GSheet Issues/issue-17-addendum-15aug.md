# Issue 17 — Ana Jessica Rosa de Paula Santos: EUR 1,530 on cancelled booking (34th check, 15 Aug 2026)

Reporter: staff | Area: Booking | Sheet row: 18

## Symptom
Booking 1308 shows CANCELLED but EUR 1,530 in payments remain with no successor booking.

## Root cause (verified 15 Aug 2026 UTC)
- Booking 1308 (Ana Jessica Rosa de Paula Santos, student 766): status = CANCELLED, confirmed = false, amountPaid = EUR 1,530
- Last updated 2026-06-07 — 69 days with no admin action
- No other bookings for student 766 — EUR 1,530 stranded on cancelled booking
- Payment 17186: EUR 1,280, transactionId D2026101, paymentDate 2026-05-05 — xeroPaymentId = null (102 days)
- Payment 17050: EUR 250, transactionId D2026101, paymentDate 2026-05-05 — xeroPaymentId = null (102 days)
- Both payments share transactionId D2026101 — likely one bank transfer split on entry

Three possible scenarios (unresolved):
  A. Refund issued but not recorded in SIS
  B. Student re-enrolled — new booking needed, link existing payments
  C. Booking cancelled in error — reinstate

No change from 33rd check (Fri 14 Aug). Xero lag now 102 days.

## Fix recipe (NOT YET RUN)

Step 1 — Determine scenario (requires human investigation):
  - Check Xero for outgoing EUR 1,530 refund to Ana Jessica (scenario A)
  - Check HubSpot deal for re-enrolment activity (scenario B)
  - Review booking status history in SIS for cancellation reason (scenario C)

Step 2A (refund issued): Reconcile payments 17186 + 17050 in Xero as refunded.

Step 2B (re-enrolment): Create new booking; re-link payments.
  SQL: UPDATE payments SET booking_id = <new_booking_id> WHERE id IN (17186, 17050);

Step 2C (cancellation error): Reinstate booking 1308.
  SQL: UPDATE bookings SET status = 'CONFIRMED', confirmed = true WHERE id = 1308;
  Then reconcile payments in Xero.

Step 3 — Reconcile payments 17186 + 17050 in Xero regardless of scenario.

## Risk / category
Money — EUR 1,530 unaccounted; Xero 102d lag. Reversible once scenario confirmed. Blast radius: 1 student, 2 payments.

## Status: OPEN — no change since 33rd check. Requires human investigation. Fix NOT RUN.
Last checked: 2026-08-15 UTC (34th check)
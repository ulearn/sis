# Issue 28 — Paola Sthefane Moreira: booking confirmed=false + unreconciled payment (33rd Tue 4 Aug UTC)

Reporter: | Row: 29

Root cause (fresh Tue 4 Aug 2026 UTC — UNCHANGED, 1 day since Mon 3 Aug)
- Booking 17850 (Paola Sthefane Moreira, student 14456): CONFIRMED, confirmed=false — anomaly.
- Amount paid=null, amount open=EUR 321.35 (payment linked but amountPaid not recalculated).
- Payment 17519: EUR 321.35, Bank Transfer, xeroPaymentId=null, payment date 2026-05-07 — 89 days unreconciled.
- Booking course 24624 (Morning General, May 18-Jun 5 2026): active=true — 60 days stale.
- Booking last updated 2026-07-08.

Anomaly: Payment 17519 (EUR 321.35) linked to bk17850 via bookingId, yet amountPaid=null.

Fix recipe (NOT YET RUN)
Step 1: SELECT id, amount, method, payment_date, xero_payment_id FROM payments WHERE booking_id = 17850;
Step 2: UPDATE bookings SET confirmed = true WHERE id = 17850;
Step 3: UPDATE bookings SET amount_paid = 321.35, amount_open = 0 WHERE id = 17850; (verify total fee first)
Step 4: UPDATE booking_courses SET active = false WHERE id = 24624;
Step 5: Reconcile payment 17519 in Xero, then UPDATE payments SET xero_payment_id = "<XERO_ID>" WHERE id = 17519;

Risk: money/bookings | Reversible: yes | Blast: 1 booking, 1 payment, 1 booking course
Status: OPEN — confirmed=false, amountPaid null, payment 89d unreconciled, BC 60d stale
Last checked: Tue 4 Aug 2026 UTC (33rd check)

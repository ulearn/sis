# Issue 28 -- Paola Sthefane Missias Moreira: booking confirmed=false, payment Xero null (57th check, Wed 19 Aug 2026)

Reporter: | Area: Booking | Sheet row: 29

## Symptom
Appears in class but cannot be assigned due to payment not received flag.

## Root cause -- verified 19 Aug 2026
- Booking 17850 (Paola Sthefane Missias Moreira): status = CONFIRMED, confirmed = false -- anomaly
- Amount paid = null, amount open = EUR 321.35, amount total = EUR 321.35
- Payment 17519: EUR 321.35, Bank, 7 May 2026 -- xeroPaymentId = null (unreconciled, 104 days since payment)
- Booking last updated: 8 Jul 2026 (42 days ago)

## Fix recipe (NOT YET RUN)
Step 1: UPDATE booking SET confirmed = true, amount_paid = 321.35, amount_open = 0 WHERE id = 17850;
Step 2: Reconcile Payment 17519 (EUR 321.35, Bank) in Xero -- match to invoice.
Step 3 verify: SELECT id, confirmed, amount_paid, amount_open FROM booking WHERE id = 17850;
Step 4 verify: SELECT id, amount, xero_payment_id FROM payment WHERE id = 17519;

## Risk
Category: bookings + money | Reversible: yes | Blast radius: 1 student, 1 payment record
Payment 17519 has been Xero-unreconciled for 104 days (since May 7 2026).

## Status
Open. confirmed=false. Payment 17519 Xero-null. Fix NOT RUN.
Last checked: Wed 19 Aug 2026 UTC (57th check)

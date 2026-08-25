Issue 28 -- Paola Moreira (32nd check Mon 3 Aug 2026 UTC)
Reporter: PG | Area: Booking / Class | Sheet row: 29

Root Cause (fresh 3 Aug 2026 UTC -- unchanged from Sat 1 Aug):
- Booking 17850: status=CONFIRMED, confirmed=false, amount_paid=null
- Payment 17519 (EUR 321.35): booking_id=17850 (linked), xero_payment_id=null (unreconciled)
- amount_paid field null despite linked payment; booking not yet confirmed

Fix Recipe (NOT YET RUN):
Step 1: UPDATE bookings SET confirmed=true WHERE id=17850;
Step 2: Find Xero payment for EUR 321.35 from Paola Moreira via Hub fins/ tooling
        UPDATE payments SET xero_payment_id=XERO_ID WHERE id=17519;
Step 3: SELECT id,confirmed,amount_paid FROM bookings WHERE id=17850;

Risk: bookings/money | Reversible: yes | Blast: 1 booking (Paola Moreira) | Low priority
Status: 32nd check Mon 3 Aug 2026 UTC (2 days since Sat 1 Aug). Unchanged. NOT YET RUN.
Last checked: 2026-08-03 UTC
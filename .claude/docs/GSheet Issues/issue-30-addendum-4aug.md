# Issue 30 — Giulia Avallone: stale BC + unreconciled Xero payment (116th Tue 4 Aug UTC)

Reporter: AC | Row: 31

Root cause (fresh Tue 4 Aug 2026 UTC — UNCHANGED)
- Booking course 104 (Morning General Plus, Jun 15-Jun 26 2026): active=true — 39 days stale.
- Booking 94 (student 88 Giulia Avallone): CONFIRMED, confirmed=true, amountPaid=EUR 1151.50, amountOpen=EUR 0.
- Payment 17102: EUR 1151.50, Bank Transfer, transactionId=D2026139, xeroPaymentId=null — 91 days unreconciled.
- Milena Vinci: no student record in SIS (paying party only).

Fix recipe (NOT YET RUN)
Step 1: UPDATE booking_courses SET active = false WHERE id = 104;
Step 2: Find Xero payment for EUR 1151.50 (Giulia Avallone, bk94, May 2026, ref D2026139).
        UPDATE payments SET xero_payment_id = "<XERO_ID>" WHERE id = 17102;
Step 3: SELECT id, active FROM booking_courses WHERE id = 104;
        SELECT id, xero_payment_id FROM payments WHERE id = 17102;

Risk: bookings/financial | Reversible: yes | Blast: 1 booking course, 1 payment
Status: OPEN — BC 39d stale; Xero payment 91d unreconciled. Fix NOT RUN.
Last checked: Tue 4 Aug 2026 UTC (116th check)

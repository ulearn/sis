Issue 18 -- Flavia Nascimento Mariano: visa_status null + unreconciled payments (34th check)

Reporter: AC | Area: Visa | Sheet row: 19 | Last checked: 2026-08-18 UTC

Root cause (no change since 17 Aug):
- Student 983 (Flavia Nascimento Mariano): visa_status = null -- day 80 (last updated 2026-07-28)
- Booking 1534: CONFIRMED, confirmed=true, paid=EUR 1,308, open=EUR 0 (fully paid)
- Payment 17035: EUR 250, Bank Transfer, ref D2026087, 17 Feb 2026 -- xeroPaymentId = null
- Payment 17527: EUR 1,058, Bank, 19 May 2026 -- xeroPaymentId = null
- Booking Course 1710 (Academic Year Afternoon): 2026-06-01 to 2026-11-27, active=true (no issue)

Fix recipe (NOT YET RUN):
Step 1: Check visaStatus enum in prisma schema; then SET visa_status = APPROVED WHERE id = 983;
Step 2: Locate Xero receipts for EUR 250 (17 Feb 2026) and EUR 1,058 (19 May 2026);
        UPDATE payments SET xero_payment_id = <id> WHERE id IN (17035, 17527);

Risk: Visa flag: low-medium (confirm student has visa). Xero: medium. Reversible.

Status: Day 80 -- visa still null. Fix pending Neil approval. Last checked: 2026-08-18 UTC (34th check)
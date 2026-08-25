Issue 18 - Flavia Nascimento Mariano - visa null (23rd check Fri 14 Aug 2026 UTC)

No data change since 22nd check. Day 74 since course start (Jun 1 2026).

NOTE: Previous recipe had incorrect payment details (method/days). Corrected here.

Evidence
- Student 983: visaStatus = null, visaId = null, visaFrom = 2026-06-01, visaUntil = 2027-02-01
- Booking 1534: CONFIRMED, confirmed = true, amountPaid = 1308, amountOpen = 0, serviceEnd = 2026-11-27, last updated 2026-08-10
- Payment 17035: EUR 250, method = Bank Transfer, xeroPaymentId = null (createdAt 2026-05-05 - 101 days unreconciled)
- Payment 17527: EUR 1,058, method = Bank, xeroPaymentId = null (createdAt 2026-05-28 - 78 days unreconciled)

Fix (NOT YET RUN)
1. Set visa status approved for student 983:
   UPDATE Student SET visaStatus = 'APPROVED', updatedAt = NOW() WHERE id = 983;

2. Reconcile Payment 17035 (EUR 250, Bank Transfer, May 5) + Payment 17527 (EUR 1,058, Bank, May 28) in Xero via Hub fins/ or Xero UI.
   Update xeroPaymentId in SIS once reconciled.

Risk: Visa/Docs + Money (Xero), reversible, 1 student, 1 booking
Last checked: Fri 14 Aug 2026 UTC (23rd check)

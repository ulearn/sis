# Issue 18 — Flavia Nascimento Mariano — visa null (21st check Thu 13 Aug 2026 UTC)

No data change since 20th check. Day 73 since course start (Jun 1 2026).

## Evidence
- Student 983: visaStatus=null, visaId=null, visaFrom=2026-06-01, visaUntil=2027-02-01
- BK 1534: CONFIRMED, amountPaid=1308, amountOpen=0, serviceEnd=2026-11-27, updatedAt=2026-08-10
- Payment 17035: EUR 250, Fidelo, paymentDate=2026-02-17, xeroPaymentId=null (177 days)
- Payment 17527: EUR 1058, HubSpot, paymentDate=2026-05-19, xeroPaymentId=null (86 days)

## Fix (NOT YET RUN)
UPDATE student SET visa_status = 'APPROVED' WHERE id = 983;
Xero reconciliation: use Hub fins/ tools for pmts 17035 and 17527.

Risk: Visa/Docs + Money (Xero), reversible, 1 student 1 booking
Last checked: Thu 13 Aug 2026 UTC (21st check)
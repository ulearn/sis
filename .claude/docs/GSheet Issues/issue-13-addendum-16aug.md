# Issue 13 — Lizbeth del Carmen Sierra Martinez (insurance + visa + Xero)
Reporter: AC | Area: Doc Gen | Row 14 | 55th check Sun 16 Aug 2026 UTC — no change — Day 76 in course

ROOT CAUSE (live data, verified 16 Aug 2026):
- Student 14522 (Lizbeth del Carmen Sierra Martinez): insuranceFrom = null, insuranceUntil = null — insurance dates missing
- visaStatus = null — visa not set
- Booking 17981: CONFIRMED, confirmed = false — anomaly (EUR 1,407.50 paid, amountOpen = null)
- Payment 17520 (EUR 1,407.50, Bank, 22 May 2026): xeroPaymentId = null — 86 days unreconciled in Xero

FIX RECIPE (NOT YET RUN):
1. Set insurance dates on student 14522 (get correct dates from policy/agent):
   UPDATE student SET insurance_from = '<date>', insurance_until = '<date>' WHERE id = 14522;
2. Set visa status on student 14522:
   UPDATE student SET visa_status = '<status>' WHERE id = 14522;
3. Set booking 17981 confirmed = true (EUR 1,407.50 paid):
   UPDATE booking SET confirmed = true WHERE id = 17981;
4. Reconcile Payment 17520 in Xero (86 days outstanding):
   — Find invoice in Xero for this student; apply payment of EUR 1,407.50 dated 22 May 2026.
   — Update xero_payment_id in SIS once reconciled:
   UPDATE payment SET xero_payment_id = '<xero_id>' WHERE id = 17520;

RISK: Money / documents; reconciliation is low-risk (payment already received). Blast radius: 1 student, 1 booking, 1 payment.
STATUS: OPEN — no change. Fix NOT RUN.
Last checked: Sun 16 Aug 2026 UTC (55th check)

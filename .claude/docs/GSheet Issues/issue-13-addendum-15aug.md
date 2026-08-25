# Issue 13 — Lizbeth del Carmen Sierra Martinez (insurance null; Day 75)
Reporter: AC | Area: Booking | Row 14 | 54th check Sat 15 Aug 2026 UTC — no change

ROOT CAUSE (live data, verified 15 Aug 2026):
- Student 14522 (Lizbeth del Carmen Sierra Martinez): insuranceFrom = null, insuranceUntil = null
- Student 14522: visaStatus = null
- Booking 17981: CONFIRMED, confirmed = false — anomaly (EUR 1,407.50 paid, amountOpen = null)
- Payment 17520 (EUR 1,407.50, Bank, 2026-05-25): xeroPaymentId = null — 82 days unreconciled
- Day 75 in course as of 15 Aug 2026 UTC

FIX RECIPE (NOT YET RUN):
1. Confirm insurance dates with student/agent, then set:
   UPDATE student SET insurance_from = '<DATE>', insurance_until = '<DATE>' WHERE id = 14522;
2. Set visa status (confirm type with staff):
   UPDATE student SET visa_status = 'approved' WHERE id = 14522;
3. Set booking confirmed = true:
   UPDATE booking SET confirmed = true WHERE id = 17981;
4. Reconcile Payment 17520 (EUR 1,407.50, 25 May 2026) in Xero.

RISK: Data hygiene; reversible. Blast radius: 1 student, 1 booking, 1 Xero reconciliation.
STATUS: OPEN — no change. Fix NOT RUN.
Last checked: Sat 15 Aug 2026 UTC (54th check)
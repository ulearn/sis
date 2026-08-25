Issue 30: Giulia Avallone / Milena Vinci - Stale BC + Xero-Null Payments
Reporter: AC | Area: booking | Sheet row: 31 | 123rd check Mon 10 Aug 2026 UTC

SYMPTOM
Giulia Avallone's mother (Milena Vinci) listed as student in SIS.

ROOT CAUSE - 123rd check Mon 10 Aug 2026 UTC (unchanged)
Booking Course 104 (Morning General Plus, 15 Jun to 26 Jun 2026): active=true -- 45 days stale (booking 94, student 88 Giulia Avallone)
Booking 94: CONFIRMED, confirmed=true, EUR 1,151.50 paid.
Payment 17102: EUR 1,151.50, Bank Transfer, created 5 May 2026 -- xeroPaymentId=null -- 97 days unreconciled (booking 94)
Payment 945: EUR 4,231.00, Bank Transfer, created 9 Apr 2026 -- xeroPaymentId=null -- 123 days unreconciled (booking 79, Milena Verdi)

FIX RECIPE - NOT YET RUN
Step 1 - Deactivate BC 104:
UPDATE BookingCourse SET active=false WHERE id=104;

Step 2 - Reconcile payment 17102 (EUR 1,151.50) in Xero:
  Find corresponding Xero payment for booking 94; update xeroPaymentId on payment 17102.

Step 3 - Reconcile payment 945 (EUR 4,231.00) in Xero:
  Find corresponding Xero payment for booking 79; update xeroPaymentId on payment 945.

Step 4 - Verify:
SELECT id, endDate, active FROM BookingCourse WHERE id=104;
SELECT id, amount, xeroPaymentId FROM Payment WHERE id IN (17102,945);

RISK: data-hygiene/money. Reversible. Blast radius: students 88 + Milena Verdi.

STATUS: OPEN. BC 104 45d stale. Pmt 17102 97d Xero-null + pmt 945 123d Xero-null.
Last checked: 2026-08-10 UTC
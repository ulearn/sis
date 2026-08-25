Issue 30 - Giulia Avallone / Milena Verdi: Stale BC104 + Xero 148 Days (121st check, Sat 8 Aug 2026 UTC)

Reporter: (booking) | Area: Booking | Sheet row: 31

SYMPTOM: BC 104 stale active 43 days; payment 17102 unreconciled in Xero for 148 days.

ROOT CAUSE (live 2026-08-08 UTC):
  BC 104 (Morning General Plus, bk 94, Giulia Avallone student 88): endDate=2026-06-26, active=true - 43 days stale (was 42)
  Payment 17102: EUR 1151.50, Bank Transfer, paymentDate=2026-03-13, xeroPaymentId=null - 148 days unreconciled (was 147)
    transactionId=D2026139, receipt=R2026890, ref=ULEARN202603031727 SP - Ai, dataSource=FIDELO, fideloPaymentId=37311
  Booking 94: CONFIRMED, confirmed=true, amountTotal=EUR 1151.50, amountPaid=EUR 1151.50 (fully paid in SIS)
  Payment 945: EUR 4231, Bank Transfer, xeroPaymentId=null, bookingId=79 (Milena Verdi student 73) - also unreconciled

FIX RECIPE (NOT YET RUN):
  Step 1: UPDATE BookingCourse SET active = false WHERE id = 104;
  Step 2: Reconcile payment 17102 in Xero - find EUR 1151.50, Mar 13 2026, ref ULEARN202603031727, receipt R2026890.
          Match to invoice for booking 94 (Giulia Avallone).
  Step 3: Review payment 945 (EUR 4231, bk 79, Milena Verdi) - also missing xeroPaymentId.

RISK: Money (Xero: EUR 1151.50 + EUR 4231 = EUR 5382.50 unreconciled, 148 days). Accounting work.
Status: OPEN - Fix NOT RUN
Last checked: 2026-08-08 UTC (121st hourly check)
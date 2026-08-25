Issue 26: Ivan Rodriguez - Stale BCs + EUR 250 Open + Xero-Null Payments
Reporter: pg | Area: booking / class | Sheet row: 27 | 60th check Mon 10 Aug 2026 UTC

SYMPTOM
Intensive students only appear once in to be assigned.

ROOT CAUSE - 60th check Mon 10 Aug 2026 UTC (unchanged from 59th check Sun 9 Aug)
Booking Course 23 (Intensive General 30, ended 22 May 2026): active=true -- 80 days stale (booking 22, Ivan Rodriguez Solares)
Booking Course 24826 (2 weeks Intensive General 30, ended 19 Jun 2026): active=true -- 52 days stale (booking 18034)
Booking 18034: PARTIAL, confirmed=false, EUR 250 open (amountPaid=845, total=1,095)
Payment 17023: EUR 1,698, TransferMate, 14 Feb 2026 -- xeroPaymentId=null, bookingId=22
Payment 17237: EUR 250, Stripe, 1 Oct 2025 -- xeroPaymentId=null, bookingId=22
Payment 17683: EUR 845, Bank, 23 Apr 2026 -- xeroPaymentId=null, bookingId=18034
All 3 payments unreconciled in Xero.

FIX RECIPE - NOT YET RUN
Step 1 - Deactivate BCs 23 + 24826:
UPDATE BookingCourse SET active=false WHERE id IN (23,24826);

Step 2 - Chase EUR 250 outstanding on booking 18034:
  Contact student or agent to collect EUR 250 balance.
  Once paid, link payment and update booking 18034:
    set amountPaid=1095, amountOpen=0, confirmed=true, status='CONFIRMED'.

Step 3 - Reconcile payments 17023, 17237, 17683 in Xero:
  Find corresponding Xero payment records and update xeroPaymentId on each.

Step 4 - Verify:
SELECT id, endDate, active FROM BookingCourse WHERE id IN (23,24826);
SELECT id, amount, xeroPaymentId FROM Payment WHERE id IN (17023,17237,17683);

RISK: bookings/money. Reversible. Blast radius: students on bookings 22 + 18034.

STATUS: OPEN. BCs 23+24826 80d+52d stale. EUR 250 open. 3 payments Xero-null.
Last checked: 2026-08-10 UTC
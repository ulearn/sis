Issue 26 addendum 6 Aug 2026 -- Ivan Rodriguez intensive class assign
Root Cause (Thu 6 Aug UTC)
Two stale BCs (different Ivan Rodriguez students):
  BC 23 (bk 22, student 18 Ivan Rodriguez Solares, Intensive General 30, ended May 22 2026): 76d stale
  BC 24826 (bk 18034, student 14532 Ivan Rodriguez, 2wk Intensive General 30, ended Jun 19 2026): 48d stale
Booking 18034: PARTIAL, confirmed=false, EUR 845 paid, EUR 250 open, total EUR 1095
Payment 17683: EUR 845, Bank, xero_payment_id=null, payment_date=Apr 23 2026 -- 105d unreconciled

Fix Recipe (NOT YET RUN)
  UPDATE booking_courses SET active=false WHERE id IN (23, 24826);
  Chase EUR 250 balance from student/agency (manual)
  Reconcile pmt 17683 in Xero (Bank ~Apr 23 2026, manual)
  After EUR 250 received: UPDATE bookings SET status='CONFIRMED',confirmed=true,amount_paid=1095,amount_open=0 WHERE id=18034;

Risk: bookings/money | Reversible for BCs | Xero+chase manual
Status: Unchanged. Last checked: Thu 6 Aug 2026 UTC (53rd check)
BC 23: 76d stale | BC 24826: 48d stale | Pmt 17683: 105d unreconciled | EUR 250 open

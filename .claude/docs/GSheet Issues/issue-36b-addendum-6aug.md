Issue 36b addendum 6 Aug 2026 -- Pietro Caccianiga + Paola Missias Moreira
Root Cause (Thu 6 Aug UTC)

Pietro Caccianiga (student 14521, bk 17980):
  Fully paid EUR 5331, confirmed=true. Accommodation 11311 (bed 84, Jun 28 - Sep 13 2026) dates correct.
  Payment 17733: EUR 5331, Bank, payment_date=2026-06-02, xero_payment_id=null -- 65d unreconciled

Paola Sthefane Missias Moreira (bk 17850):
  CONFIRMED, confirmed=false (anomaly). amount_paid=null (anomaly). amount_open=321.35
  Payment 17519: EUR 321.35, Bank, payment_date=2026-05-07, xero_payment_id=null -- 91d unreconciled
  BC 24624 (Morning General, May 18 - Jun 5 2026): active=true -- 62d stale, 0 class assignments

Fix Recipe (NOT YET RUN)
  UPDATE bookings SET amount_paid=321.35, amount_open=0, confirmed=true WHERE id=17850;
  UPDATE booking_courses SET active=false WHERE id=24624 AND booking_id=17850;
  Reconcile pmt 17733 in Xero (Bank EUR 5331 ~Jun 2 2026, manual)
  Reconcile pmt 17519 in Xero (Bank EUR 321.35 ~May 7 2026, manual)

Risk: money/bookings | Reversible | Low (2 students)
Status: Unchanged. Last checked: Thu 6 Aug 2026 UTC (149th check)
Pietro pmt 17733: 65d unreconciled | Paola pmt 17519: 91d unreconciled | Paola BC 24624: 62d stale

Issue 30 addendum 6 Aug 2026 -- Giulia Avallone / Milena Vinci
Root Cause (Thu 6 Aug UTC)
  Milena Vinci: not found in students table (may already be removed)
  BC 104 (Morning General Plus, Jun 15-26 2026, bk 94): active=true -- 41d stale
  Booking 94 (Giulia Avallone, student 88): CONFIRMED, confirmed=true, EUR 1151.50 fully paid
  Payment 17102: EUR 1151.50, Bank Transfer (TransferMate D2026139), xero_payment_id=null -- 146d unreconciled (Mar 13 2026)

Fix Recipe (NOT YET RUN)
  UPDATE booking_courses SET active=false WHERE id=104 AND booking_id=94;
  Reconcile pmt 17102 in Xero: Bank Transfer EUR 1151.50 ~Mar 13 2026, TransferMate ref D2026139

Risk: bookings/money | Reversible | Low blast radius
Status: Unchanged. Last checked: Thu 6 Aug 2026 UTC (118th check)
BC 104: 41d stale | Pmt 17102: 146d unreconciled (since Mar 13 2026)

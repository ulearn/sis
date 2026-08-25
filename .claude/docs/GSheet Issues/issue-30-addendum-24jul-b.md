Issue 30 -- Giulia Avallone / Milena Vinci: Stale BC + Xero Null -- Addendum 24 Jul (b)

Reporter: AC | Area: Booking | Sheet row: 31
Checked: Fri 24 Jul 2026 UTC -- 41st hourly check, 159th total run

ROOT CAUSE (confirmed, unchanged)
- Booking course 104 (Morning General Plus, ended 26 Jun 2026): active = still true -- 28 days stale
- Payment 17102: EUR 1,151.50, booking 94, xeroPaymentId = null, paymentDate 13 Mar 2026
  CORRECTION: Prior checks said 80 days -- written in May. Correct current age: 133 days unreconciled.

CURRENT STATUS -- ESCALATING: XERO NULL NOW 133 DAYS
- Booking course 104: active = true, ended 26 Jun 2026, 28 days stale, 1 class assignment
- Payment 17102: EUR 1,151.50, xeroId = null, paymentDate 13 Mar 2026 = 133 days unreconciled (4+ months)

FIX RECIPE (NOT YET RUN)

Step 1 -- Deactivate booking course 104:
  UPDATE booking_courses SET active = false WHERE id = 104;
  Verify: SELECT id, active, end_date FROM booking_courses WHERE id = 104;

Step 2 -- Reconcile payment 17102 in Xero:
  Find invoice/receipt for EUR 1,151.50 paid around 13 Mar 2026 for booking 94 (Giulia Avallone).
  UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17102;

Step 3 -- Milena Vinci student record:
  If she has a student record that should not exist, soft-delete via SIS admin.
  Confirm no active bookings under her record first.

RISK: bookings + accounts | Reversible: Yes | Blast radius: booking 94 (single)
STATUS: Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC
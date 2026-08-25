# Issue 36b - Stale Booking Accommodations (addendum 2 Aug 2026 - run C)
Reporter: KC | Area: Booking / Accomm | Sheet row 38

Root cause (140th check, 4th today - Sun 2 Aug 2026 UTC):

Stale BA count: 47 (active + bed assigned + end_date < 2026-08-02) - unchanged from 3rd check today.

Three BAs ending today (Aug 2) still active = true, end_date = 2026-08-02 (not yet in the stale count):
- BA 23: bed 168, fee EUR 720, booking 17842
- BA 11358: bed 180, fee EUR 900, booking 17831
- BA 11338: bed 33, fee null, booking 18145

Tomorrow (Aug 3) these 3 will enter the stale count: effective total deactivation target = 50.

Pietro Caccianiga payment 17733 (EUR 5,331, Bank, booking 17980, payment date 2026-06-02):
xeroPaymentId = null - 61 days unreconciled (unchanged).

Fix recipe (NOT YET RUN):

Step 1 - Deactivate all stale BAs (including the 3 ending today):
  UPDATE booking_accommodations
  SET active = false
  WHERE active = true AND bed_id IS NOT NULL AND end_date <= CURRENT_DATE;
  -- Verify first: SELECT id, bed_id, end_date, booking_id, fee
  -- FROM booking_accommodations
  -- WHERE active = true AND bed_id IS NOT NULL AND end_date <= CURRENT_DATE ORDER BY end_date;

Step 2 - Reconcile payment 17733 in Xero:
  Find EUR 5,331 bank receipt dated 2026-06-02; copy Xero payment ID.
  UPDATE payments SET xero_payment_id = '<xero-id>' WHERE id = 17733;

Risk: data-hygiene + money | reversible | Last checked: 2026-08-02 UTC run C

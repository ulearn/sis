# Issue 36b — Stale Booking Accommodations (addendum 2 Aug 2026 — run B)

Reporter: KC | Area: Booking / Accomm | Sheet row 38

## Root cause (2 Aug 2026 UTC, 139th check, 3rd today)

Stale BA count: 47 (active + bed assigned + endDate < 2026-08-02).
Previous count was 50. Three BAs ended today (Aug 2) take effective total back to 50.

Three ended today (still active=true — must deactivate):
- BA 23: bed 168, fee EUR 720, booking 17842
- BA 11358: bed 180, fee EUR 900, booking 17831
- BA 11338: bed 33, fee null, booking 18145

Pietro Caccianiga payment 17733 (EUR 5,331, Bank, booking 17980, paymentDate 2026-06-02):
xeroPaymentId = null — 61 days unreconciled (confirmed).

## Fix recipe (NOT YET RUN)

Step 1 — Deactivate 50 stale BAs:
  SELECT id, bed_id, end_date, booking_id, fee FROM booking_accommodations
  WHERE active=true AND bed_id IS NOT NULL AND end_date <= now()::date ORDER BY end_date;
  -- then: UPDATE booking_accommodations SET active=false
  -- WHERE active=true AND bed_id IS NOT NULL AND end_date <= now()::date;

Step 2 — Reconcile payment 17733 in Xero:
  Find EUR 5,331 bank receipt dated 2026-06-02; copy Xero ID.
  UPDATE payments SET xero_payment_id = '<xero-id>' WHERE id = 17733;

## Risk: data-hygiene + money | reversible | Last checked: 2026-08-02 UTC run B
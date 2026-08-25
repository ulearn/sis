# Issue 36b — Pietro Caccianiga / Stale Booking Accommodations (141st check, 1st on Aug 3)
Sheet row: 38 | Reporter: AC/Diego | Area: Booking / Accomm

Symptom
Accommodation dates error; stale BAs blocking bed allocation; Pietro payment unreconciled.

Root cause (Mon 3 Aug 2026 UTC):
- Stale booking accommodations: 50 total (endDate <= 2026-08-02, active=true, bed assigned).
  Includes 3 that ended Aug2: BA 23 (bed 168, EUR 720, bk17842), BA 11358 (bed 180, EUR 900, bk17831), BA 11338 (bed 33, fee null, bk18145).
- Pietro Caccianiga payment 17733 (EUR 5,331, Bank, 2 Jun 2026): bookingId=17980 (linked — NOT an orphan), xeroPaymentId=null — 62 days unreconciled.
  Correction from prior recipe: payment 17733 belongs to booking 17980, not unlinked. Only Xero reconciliation needed.
- State unchanged. Fix NOT RUN.

Fix recipe (NOT YET RUN):

Step 1 — Deactivate 50 stale booking accommodations:
  UPDATE booking_accommodations SET active = false
  WHERE end_date <= '2026-08-02' AND active = true AND bed_id IS NOT NULL;
  Verify count before: SELECT COUNT(*) FROM booking_accommodations WHERE end_date <= '2026-08-02' AND active=true AND bed_id IS NOT NULL;
  Expected: 50

Step 2 — Reconcile Pietro payment 17733 with Xero:
  - Find/create Xero payment for booking 17980 (EUR 5,331, 2 Jun 2026).
  - Once Xero payment ID obtained:
    UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17733;

Risk/category: accommodation (data-hygiene) + accounts (Xero) — reversible | blast radius: 50 beds freed + 1 payment
Status: NOT RUN — 141st check, 1st on Mon 3 Aug 2026 UTC

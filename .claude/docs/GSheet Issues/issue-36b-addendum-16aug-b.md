issue 36b — Pietro Caccianiga accommodation fee null (319th run, 16 Aug 2026 UTC)

Reporter: Diego | Area: Booking/Accommodation | Row: 38

SYMPTOM
Booking Accommodation 11393 (bed 88, 22 Aug-13 Sep) has fee=null. Check-in Saturday 22 Aug (6 days).

ROOT CAUSE (live, 319th run)

Student: Pietro Caccianiga (student 14521, booking 17980)
Booking 17980: CONFIRMED, fully paid EUR 5,331

Booking Accommodations:
  BA 11311  bed 84  28 Jun-22 Aug  fee EUR 3,850  active=true  check-out Sat 22 Aug (6 days)
  BA 11393  bed 88  22 Aug-13 Sep  fee=null       active=true  check-in Sat 22 Aug (6 days) — CRITICAL

Bed 88 fee history (from other bookings):
  BA 11340: 27 Jun-22 Aug, fee=EUR 1 (clearly a placeholder, not a real rate)
  BA 11228: 17 Jan-6 Jun, fee=EUR 6,800 (20.7 weeks = ~EUR 328/week)

BA 11393 covers 22 Aug-13 Sep = 22 days (~3.1 weeks).
Expected fee at ~EUR 328/week: ~EUR 1,000-1,050 (confirm with booking agreement/Diego).

FIX RECIPE (NOT YET RUN — must be done before Sat 22 Aug)

Step 1 — Set fee on Booking Accommodation 11393
  Confirm the agreed rate with Diego or check original booking quote.
  Fix:    UPDATE booking_accommodations SET fee = <agreed_amount> WHERE id = 11393;

Step 2 — Reconcile Payment 17733 in Xero (if still unreconciled)
  Payment 17733 linked to booking 17980: verify xeroPaymentId is still null.
  SELECT id, amount, xero_payment_id FROM payments WHERE id = 17733;
  Reconcile in Xero manually once fee is confirmed.

RISK
Category: money/bookings. Fee null on accommodation with check-in in 6 days.
Reversible. Single student, low blast radius.

STATUS
319th run, 16 Aug 2026 UTC. Fix NOT RUN. Check-in Sat 22 Aug — fee must be set before then.
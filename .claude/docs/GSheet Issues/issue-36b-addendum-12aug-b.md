Issue 36b: Pietro Caccianiga Accommodation (164th check, 12 Aug 2026)
Reporter: AC | Area: Booking / Accommodation | Row: 38

Wed 12 Aug 2026 UTC. 164th check. NEW: BA 11393 bedId now = 88 (assigned since previous check - was null in all prior runs). Fee still null. Payment 17733 still unreconciled in Xero (70 days).

Root Cause (verified 164th check):
- Booking 17980 (Pietro Caccianiga, student 14521): CONFIRMED, EUR 5,331 paid, EUR 0 open
- Payment 17733 (EUR 5,331, Bank, 2 Jun 2026): xeroPaymentId = null - 70 days unreconciled
- Booking Course 24772 (General English AM): active, ends 21 Aug 2026 (9 days - approaching)
- Booking Accommodation 11393: bedId = 88 [NEW - was null in all prior checks]
  - Bed 88: Room A2/Room 3 (Standard), Property A2, Provider 15
  - Period: 22 Aug to 13 Sep 2026, fee = null (still not set)
- Booking Accommodation 11311: 28 Jun to 22 Aug 2026, fee = EUR 3,850, active = true (first period OK)

Fix Recipe (NOT YET RUN):
Step 1 - Reconcile payment 17733 in Xero: Open Xero, find invoice for booking 17980, match EUR 5,331 Bank Transfer 2 Jun 2026.
Step 2 - Set BA 11393 fee: Confirm correct fee for 22 Aug to 13 Sep 2026 (3 weeks, Property A2/Standard) with accounts. Then: UPDATE booking_accommodations SET fee = [correct_amount] WHERE id = 11393;
Step 3 - Deactivate BC 24772 on or after 22 Aug: UPDATE booking_courses SET active = false WHERE id = 24772;
Verify: SELECT id, bed_id, fee, start_date, end_date FROM booking_accommodations WHERE id IN (11311, 11393);
         SELECT id, xero_payment_id FROM payments WHERE id = 17733;

Risk: payments/accommodation | Reversible: yes | Blast radius: 1 student, 1 payment, 1 BA fee
APPROACHING: BC 24772 ends 21 Aug (9 days). Set BA fee before student transitions.
Status: OPEN. NEW: bed 88 now assigned (progress). Fee still null. Xero 70d. Fix NOT RUN.
Last checked: Wed 12 Aug 2026 UTC (164th check)
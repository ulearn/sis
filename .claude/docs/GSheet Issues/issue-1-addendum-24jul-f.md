Issue 1 -- Orphan Payments + Stale Booking Courses/Accommodations -- Addendum 24 Jul (f)

Reporter: NM | Area: Cleanup | Sheet row: 2
Checked: Fri 24 Jul 2026 UTC -- 60th hourly check, 156th total run

CURRENT STATUS -- UNCHANGED

Orphan payments (bookingId = null): 4
  Payment 4781: EUR 380, Flywire, 10 Apr 2026, fideloPaymentId = 32056 -- permanently unresolvable (Fidelo legacy)
  Payment 16988: EUR 339.90, Bank, 28 Apr 2026 -- 87 days orphaned, no fideloId
  Payment 16989: EUR 339.90, Bank, 28 Apr 2026 -- 87 days orphaned, no fideloId
  Payment 17187: EUR 6,151, TransferMate Escrow, 5 May 2026, fideloPaymentId = 37587, transactionId D2026226 -- 80 days

Stale active booking courses: 24,436 -- unchanged
Stale active booking accommodations with beds: 43 -- unchanged

FIX RECIPE (NOT YET RUN)

Part A -- Payments 16988 + 16989 (EUR 339.90 each, Bank, 28 Apr 2026):
  Search bookings for a student who paid EUR 679.80 total (2 x 339.90) in Bank Transfers around Apr 2026.
  If found: UPDATE payments SET booking_id = <booking_id> WHERE id IN (16988, 16989);

Part B -- Payment 17187 (EUR 6,151 TransferMate Escrow):
  Search TransferMate dashboard or Fidelo records for D2026226 / fideloPaymentId 37587.
  If found: UPDATE payments SET booking_id = <booking_id> WHERE id = 17187;

Part C -- Payment 4781: flag as irrecoverable in Xero; do not delete.

Part D -- Stale booking courses (24,436): bulk deactivation SQL in issue-1-orphan-payments.md; run in batches.

Part E -- Stale booking accommodations with beds (43):
  SELECT id, booking_id, bed_id, start_date, end_date FROM booking_accommodations
  WHERE active = true AND bed_id IS NOT NULL AND end_date < NOW() ORDER BY end_date DESC LIMIT 50;
  UPDATE booking_accommodations SET active = false WHERE id IN (<ids>);

RISK: money (A/B/C) + data-hygiene (D/E) | Reversible: Yes | No active student impact

STATUS: Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC
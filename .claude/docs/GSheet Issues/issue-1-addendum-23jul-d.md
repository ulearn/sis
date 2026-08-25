# Issue 1 --- Orphan Payments + Stale Booking Courses / Accommodations
Reporter: NM | Area: Cleanup | Sheet Row 2

## Root Cause (52nd hourly check, Thu 23 Jul 2026 UTC --- 145th total)

Orphan payments (4, unchanged):
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 --- bookingId = null --- 86 days
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 --- bookingId = null --- 86 days
- Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026 --- bookingId = null,
  fideloPaymentId = 37587, transactionId = D2026226 --- Fidelo-migrated orphan --- 83 days
- Payment 4781: EUR 380, Flywire, 20 Aug 2019 --- bookingId = null, fideloId = 32056 --- permanently unresolvable

Stale active records (unchanged):
- Booking courses: 24,436 with active = true and endDate < 2026-07-23
- Booking accommodations: 11,175 with active = true and endDate < 2026-07-23

## Fix Recipe (NOT YET RUN)

Link 16988+16989 (search for booking with ~EUR 339.90 paid by bank around 28 Apr 2026):
  SELECT b.id, s.first_name, s.last_name, b.amount_paid FROM bookings b
  JOIN students s ON s.id = b.student_id
  WHERE b.amount_paid BETWEEN 330 AND 350 AND b.created_at > '2026-03-01' LIMIT 20;
  UPDATE payments SET booking_id = <id> WHERE id IN (16988, 16989); -- NOT YET RUN

Deactivate stale BCs:
  UPDATE booking_courses SET active = false WHERE active = true AND end_date < '2026-07-23'; -- 24,436 rows
  -- NOT YET RUN

Deactivate stale BAs:
  UPDATE booking_accommodations SET active = false WHERE active = true AND end_date < '2026-07-23'; -- 11,175 rows
  -- NOT YET RUN

## Risk
- money (EUR ~6,830 orphan payments), data-hygiene (~35,000 rows batch)
- Reversible; test with BEGIN/ROLLBACK before committing

## Status
OPEN --- unchanged. Fix NOT RUN.
Last checked: Thu 23 Jul 2026 UTC (52nd hourly, 145th total)
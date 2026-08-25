# Issue 1 — Orphan Payments + Stale Booking Courses (270th check, Mon 17 Aug 2026 UTC)
Reporter: NM | Area: Cleanup | Sheet row: 2

## Root cause (verified)
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 — booking_id = null (not linked; likely Booking 17856)
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 — booking_id = null (not linked; likely Booking 17857)
- Payment 4781: EUR 380, Flywire 2019, ref D20191404 — booking_id = null (legacy orphan, low priority)
- Payment 17187: EUR 6,151, TransferMate, ref D2026226 — booking_id = null (leave as-is, 2025 service)
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed = false, amount_paid EUR 339.90
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed = false, amount_paid EUR 339.90
- Booking Course 24630 (General English AM Plus): ended 2026-07-10 — 38 days stale, active = true
- Booking Course 24631 (General English AM Plus): ended 2026-07-10 — 38 days stale, active = true

## Fix recipe (NOT YET RUN)
Step 1 — Link Payment 16988 to Booking 17856:
  UPDATE payment SET booking_id = 17856, updated_at = NOW() WHERE id = 16988;

Step 2 — Link Payment 16989 to Booking 17857:
  UPDATE payment SET booking_id = 17857, updated_at = NOW() WHERE id = 16989;

Step 3 — Set confirmed = true on both bookings:
  UPDATE booking SET confirmed = true, updated_at = NOW() WHERE id IN (17856, 17857);

Step 4 — Deactivate stale Booking Courses 24630 and 24631:
  UPDATE booking_course SET active = false WHERE id IN (24630, 24631);

## Risk: Data-hygiene / payments | Reversible | Blast radius: 2 payments, 2 bookings, 2 BCs
## Status: OPEN — Fix NOT RUN | Last checked: Mon 17 Aug 2026 UTC (270th check)
# Issue 1 Addendum 11 Aug 2026-c (215th check)

Tue 11 Aug 2026 UTC. No change since 214th check.

## Current State -- Orphan Payments (4 total)

- Payment 4781: EUR 380, comment ULS771773625/21022 -- old migration artefact
- Payment 16988: EUR 339.90, 2026-04-28 -- likely for booking 17856 (Margherita Galbusera)
- Payment 16989: EUR 339.90, 2026-04-28 -- likely for booking 17857 (Francesca Fassina)
- Payment 17187: EUR 6,151, comment ULEARNP2026124 -- unknown booking

## Related Records

- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed = false, amountPaid = 339.90, amountOpen = null
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed = false, amountPaid = 339.90, amountOpen = null
- Booking Courses 24630 + 24631 (General English AM Plus): ended 2026-07-10, active = true (32 days stale)

CAUTION: Verify amountPaid on bookings 17856/17857 is NOT derived from linked payments before linking -- risk of double-counting.

## Fix Recipe (NOT YET RUN)

Step 1 -- Verify amountPaid derivation:
  SELECT id, amount_paid, amount_open FROM bookings WHERE id IN (17856, 17857);

Step 2 (if safe) -- Link payments:
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;

Step 3 -- Set confirmed = true:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 4 -- Deactivate stale Booking Courses:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 5 -- Payments 4781 and 17187: manual triage (no clear booking match).

## Risk

- Category: money / data-hygiene | Reversible: yes (with care)
- Total orphaned: EUR 7,210.80

Status: Open -- 4 orphan payments, 2 bookings unconfirmed. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (215th check)
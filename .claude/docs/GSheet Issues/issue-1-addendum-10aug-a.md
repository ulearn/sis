# Issue 1 — Orphan Payments (206th check)

Reporter: NM | Area: Cleanup | Sheet row: 2

## Root Cause (206th check — Mon 10 Aug 2026 UTC)
Unchanged from 205th check (9 Aug). All items remain unresolved:

Orphan payments (bookingId = null):
- Payment 4781: EUR 380.00, Flywire, 2019-08-20 — 2,550 days orphaned
- Payment 16988: EUR 339.90, Bank, 2026-04-28 — 104 days orphaned
- Payment 16989: EUR 339.90, Bank, 2026-04-28 — 104 days orphaned
- Payment 17187: EUR 6,151.00, TransferMate Escrow, 2026-05-01 — 101 days orphaned

Bookings with 0 linked payments:
- Booking 17856: confirmed=false, amountOpen=null, 0 payments linked
- Booking 17857: confirmed=false, amountOpen=null, 0 payments linked

Stale active booking courses:
- BC 24630 (General English AM Plus): endDate 2026-07-10, active=true — 31 days stale
- BC 24631 (General English AM Plus): endDate 2026-07-10, active=true — 31 days stale

## Fix Recipe (NOT YET RUN)

Step 1 — Link payments 16988 + 16989 to bookings:
  UPDATE "Payment" SET "bookingId" = 17856, "updatedAt" = NOW() WHERE id = 16988;
  UPDATE "Payment" SET "bookingId" = 17857, "updatedAt" = NOW() WHERE id = 16989;

Step 2 — Confirm bookings 17856 + 17857:
  UPDATE "Booking" SET confirmed = true, "updatedAt" = NOW() WHERE id IN (17856, 17857);

Step 3 — Deactivate stale BCs 24630 + 24631:
  UPDATE "BookingCourse" SET active = false, "updatedAt" = NOW() WHERE id IN (24630, 24631);

Step 4 — Payment 4781 (EUR 380, 2019 Flywire): no matching booking, 7 years old. Neil decides: write-off or archive.

Step 5 — Payment 17187 (EUR 6,151 TransferMate Escrow): investigate in Hub/TransferMate to identify booking. Neil acts.

## Risk / Category
Category: money / data-hygiene | Reversible: yes (back up first) | Blast radius: 2 students + EUR 6,531 unreconciled

## Status: Open — Unchanged (206th check)
Last checked: 2026-08-10 UTC
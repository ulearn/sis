# Issue 28 addendum 22 Aug 2026 (62nd check)

Sheet row 29 | Reporter: varies | Area: Booking

## Root cause (unchanged since 61st check)
- Booking 17850 (Paola Sthefane Moreira): CONFIRMED, confirmed = false — anomaly
- Amount paid = null, amount open = EUR 321.35
- Payment 17519: EUR 321.35, 7 May 2026, Xero payment ID = null — 107 days unreconciled
- Booking Course 24624 (Morning General): active = true, ended 5 Jun 2026 — 78 days stale, 0 class assignments

## Fix recipe (NOT YET RUN)
Step 1 — Fix booking confirmed flag and amount paid:
  prisma.booking.update({ where: { id: 17850 }, data: { confirmed: true, amountPaid: 321.35 } })

Step 2 — Deactivate stale booking course:
  prisma.bookingCourse.update({ where: { id: 24624 }, data: { active: false } })

Step 3 — Reconcile Payment 17519 in Xero (manual step):
  Match EUR 321.35 payment (7 May 2026) in Xero to booking 17850.
  Then update xeroPaymentId on payment 17519.

## Risk / category
money / bookings / data-hygiene | reversible | Xero reconciliation is external

## Status
Fix NOT RUN. 62nd check. Last checked: 2026-08-22 UTC.
# Issue 1 addendum 22 Aug 2026 (291st check)

Sheet row 2 | Reporter: NM | Area: Cleanup

## Root cause (unchanged since 290th check)
- Payment 16988: EUR 339.90, 28 Apr 2026, booking_id = null (orphan), xero_payment_id = null
- Payment 16989: EUR 339.90, 28 Apr 2026, booking_id = null (orphan), xero_payment_id = null
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed = false, amountPaid = EUR 339.90 — zero Payment records linked
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed = false, amountPaid = EUR 339.90 — zero Payment records linked
- Booking Courses 24630 + 24631 (General English AM Plus): ended 10 Jul 2026, active = true — 43 days stale

## Fix recipe (NOT YET RUN)
Step 1 — Link orphan payments to bookings:
  prisma.payment.update({ where: { id: 16989 }, data: { bookingId: 17856 } })
  prisma.payment.update({ where: { id: 16988 }, data: { bookingId: 17857 } })

Step 2 — Set confirmed = true on bookings:
  prisma.booking.updateMany({ where: { id: { in: [17856, 17857] } }, data: { confirmed: true } })

Step 3 — Deactivate stale booking courses:
  prisma.bookingCourse.updateMany({ where: { id: { in: [24630, 24631] } }, data: { active: false } })

## Risk / category
money / bookings | reversible | blast radius = 2 students (Margherita Galbusera, Francesca Fassina)

## Status
Fix NOT RUN. 291st check. Last checked: 2026-08-22 UTC.
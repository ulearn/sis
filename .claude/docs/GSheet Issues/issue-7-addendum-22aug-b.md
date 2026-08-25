# Issue 7 addendum 22 Aug 2026 (53rd check)

Sheet row 8 | Reporter: KC | Area: Booking

## Root cause (unchanged since 52nd check)
- Booking 17909 (Sofiia Korkishchenko, student 768): status = CANCELLED, confirmed = true (anomaly)
- Amount paid = EUR 0, amount open = EUR 727.50 — 0 payment records linked
- Booking Course 24693 (Renewal - Academic Year PM): active = true, ends 13 Nov 2026, 0 class assignments
- Booking last updated 17 Jun 2026 (66 days ago)

## Fix recipe (NOT YET RUN)
Step 1 — Set confirmed = false on cancelled booking:
  prisma.booking.update({ where: { id: 17909 }, data: { confirmed: false } })

Step 2 — Deactivate booking course on cancelled booking:
  prisma.bookingCourse.update({ where: { id: 24693 }, data: { active: false } })

Note: Do NOT set amountOpen = 0 unless confirmed no payment was received.

## Risk / category
bookings / data-hygiene | reversible | blast radius = 1 student

## Status
Fix NOT RUN. 53rd check. Last checked: 2026-08-22 UTC.
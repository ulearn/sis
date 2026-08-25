# Issue 26 addendum 22 Aug 2026 (74th check)

Sheet row 27 | Reporter: varies | Area: Booking

## Root cause (unchanged since 73rd check)
- Booking Course 23 (Intensive General 30, booking 22): active = true, ended 22 May 2026 — 92 days stale, 2 class assignments still linked
- Booking Course 24826: active = true, ended 19 Jun 2026 — 64 days stale, 0 class assignments
- Booking 18034: PARTIAL, confirmed = false, amount paid = EUR 845, amount open = EUR 250
- Payment 17683: EUR 845, 23 Apr 2026, Xero payment ID = null — 121 days unreconciled

## Fix recipe (NOT YET RUN)
Step 1 — Deactivate stale booking courses:
  prisma.bookingCourse.update({ where: { id: 23 }, data: { active: false } })
  prisma.bookingCourse.update({ where: { id: 24826 }, data: { active: false } })

Step 2 — Reconcile Payment 17683 in Xero (manual step):
  Match EUR 845 payment (23 Apr 2026) in Xero to booking 18034.
  Then update xeroPaymentId on payment 17683.

Step 3 — Resolve EUR 250 open balance:
  Confirm with accounts whether EUR 250 is still outstanding or was paid another way.
  If outstanding: chase the student.
  If paid: add missing payment record.

## Risk / category
money / bookings / data-hygiene | reversible (deactivations) | Xero step is external

## Status
Fix NOT RUN. 74th check. Last checked: 2026-08-22 UTC.
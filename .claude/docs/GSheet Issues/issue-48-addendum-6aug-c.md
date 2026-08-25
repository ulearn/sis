# Issue 48 — Stale BCs + Orphan Payments (63rd check, Thu 6 Aug 2026 18:00 UTC)

Reporter: AC | Area: Attendance/classes | Sheet row: 50

## Root cause (63rd check — unchanged)

Stale booking courses:
- BC 25006 (General English AM Plus, booking 18228): ended 3 Aug 2026 - 3 days stale, 2 SCAs
- BC 24630 (General English AM Plus, booking 17857): ended 10 Jul 2026 - 27 days stale, 0 SCAs
- BC 24631 (General English AM Plus, booking 17856): ended 10 Jul 2026 - 27 days stale, 0 SCAs

Orphan payments (booking_id = null) — 100 days since 28 Apr 2026:
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026, booking_id=null, xero_payment_id=null
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026, booking_id=null, xero_payment_id=null
  Amounts match bookings 17857 (student 14462) and 17856 (student 14461).
  See Issue 1 (issue-1-addendum-6aug-e.md) for full linkage recipe.

## Fix recipe (NOT YET RUN)

Step 1 - Deactivate stale BCs:
  UPDATE booking_courses SET active = false WHERE id IN (25006, 24630, 24631);

Step 2 - Link orphan payments (coordinate with Issue 1):
  UPDATE payments SET booking_id = 17857 WHERE id = 16988;
  UPDATE payments SET booking_id = 17856 WHERE id = 16989;

## Risk
Category: bookings / data-hygiene; reversible. Coordinate Step 2 with Issue 1 fix.

## Status
Unchanged. BCs now 3d+27d+27d stale. Orphan payments 100 days. Fix NOT RUN.
Last checked: Thu 6 Aug 2026 18:00 UTC (63rd check)
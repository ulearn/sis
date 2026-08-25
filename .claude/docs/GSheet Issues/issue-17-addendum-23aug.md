# Issue 17 — Ana Jessica Rosa de Paula Santos — BC Active on Cancelled Booking — 42nd check

Reporter: AC | Sheet row: 18 | Last checked: 2026-08-23 UTC

## Root Cause (anomaly persists; BC 1350 end date was extended 21 Aug — 2 days ago)
Confirmed via Prisma 2026-08-23 UTC:
- Booking 1308: status = CANCELLED, confirmed = false. amountPaid = EUR 1,530, amountOpen = null.
- BC 1350 (Academic Year Afternoon, booking 1308): active = true, ends 2026-11-27, 0 class assignments.
  updatedAt = 2026-08-21T12:46:18 UTC — end date extended Nov 13 to Nov 27 on a CANCELLED booking.
  Someone manually edited this BC 2 days ago. 0 class assignments confirm no operational use.

Key concern: the manual edit may indicate a staff member is unaware the booking is cancelled, or intends to reinstate it.

## Fix Recipe (NOT YET RUN)
Step 1: Confirm with staff whether booking 1308 should remain cancelled or be reinstated.
  If remaining cancelled:
  UPDATE "BookingCourse" SET active = false WHERE id = 1350;
Step 2: Resolve EUR 1,530 on cancelled booking 1308 in Xero (refund or transfer).

## Risk
Money + bookings. Medium (EUR 1,530 unreconciled). Deactivation reversible.

## Status
Fix NOT RUN. BC 1350 end date manually extended on 2026-08-21 — recent edit warrants staff follow-up.
Last checked: 2026-08-23 UTC (42nd check).
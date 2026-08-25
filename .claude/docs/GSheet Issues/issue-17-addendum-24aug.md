# Issue 17 — Ana Jessica Rosa de Paula Santos — BC 1350 Active on Cancelled Booking — 43rd check

Reporter: AC | Area: Booking | Sheet row 18

## Root cause (confirmed Mon 24 Aug 2026 UTC)
- Booking 1308: status = CANCELLED, confirmed = false, updated_at 2026-08-21T12:46:18 UTC
- Amount paid = EUR 1,530, amount open = null
- BC 1350 (Academic Year Afternoon): active = true, end 2026-11-27, updated 21 Aug 2026 (3 days ago)
  End date extended Nov 13 to Nov 27 on a CANCELLED booking — 0 class assignments
- Payment 17186: EUR 1,280, Bank Transfer, 2026-05-01, xero_payment_id = null
- Payment 17050: EUR 250, Bank Transfer, 2026-02-17, xero_payment_id = null
- No change from 42nd check (Sun 23 Aug).

## Fix recipe (NOT YET RUN)
Step 1: Confirm with staff — should booking 1308 remain cancelled or be reinstated?
  (BC end date extended 21 Aug may indicate accidental edit or intent to reinstate.)
  If staying cancelled: UPDATE booking_courses SET active = false WHERE id = 1350;
Step 2: Resolve EUR 1,530 in Xero — confirm refund status or apply to another booking.

## Risk
Money + bookings. EUR 1,530 unreconciled. BC deactivation reversible. Medium risk.

## Status
OPEN — Fix NOT RUN. BC manually extended 21 Aug. Awaiting staff clarification.
Last checked: 2026-08-24 UTC (495th run, 43rd issue check)

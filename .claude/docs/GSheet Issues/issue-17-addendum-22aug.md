# Issue 17 Addendum - 22 Aug 2026 (41st check)
Ana Jessica Rosa de Paula Santos | Booking | Sheet row 18

## New finding (22 Aug, first noted 40th check)
Booking Course 1350 end date extended from 13 Nov 2026 to 27 Nov 2026 - updated 2026-08-21 12:46 UTC. Extension applied on a CANCELLED booking (bk1308). BC 1350 still has 0 class assignments.

## Root cause
- Booking 1308 (Ana Jessica): status = CANCELLED, confirmed = false, amountPaid = EUR 1,530, amountOpen = null
- Booking Course 1350 (Academic Year Afternoon): active = true, starts 25 May 2026, ends 27 Nov 2026, 0 SCAs
- BC 1350 updatedAt = 2026-08-21 12:46 UTC - end date extended from Nov 13 to Nov 27 on a cancelled booking (anomaly)
- Extension appears to be a manual edit; investigate with staff who made the change and why

## Fix recipe (NOT YET RUN)
1. Investigate who extended BC 1350 end date on 21 Aug and why (check with staff).
2. Confirm whether EUR 1,530 was refunded or transferred to a replacement booking.
3. Deactivate BC 1350 (safe - 0 SCAs): UPDATE booking_courses SET active = false WHERE id = 1350;
4. If refund confirmed in Xero: no further action needed.
5. If transferred: locate replacement booking and confirm it is active and correct.

## Risk / category
Booking + financial. BC deactivation reversible. EUR 1,530 resolution medium risk.

## Status
BC end date extended on cancelled booking - anomaly confirmed. Fix pending Neil approval.

## Last checked
2026-08-22 Sat UTC (41st check)

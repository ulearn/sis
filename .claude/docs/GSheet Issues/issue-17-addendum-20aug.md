Issue 17 Addendum 20 Aug 2026 (39th check)
Ana Jessica Rosa de Paula Santos | Booking | Sheet row 18

No change from 19 Aug.

Root cause:
- Booking 1308 CANCELLED confirmed=false last updated 2026-06-07 (74 days ago)
- Amount total EUR 1530 amount paid EUR 1530 amount open null - fully paid then cancelled
- Booking Course 1350 Academic Year Afternoon active=true ends 2026-11-13 (85 days remaining) 0 SCAs
- Outstanding: is EUR 1530 refunded or applied to a replacement booking?

Fix recipe (NOT YET RUN):
1. Confirm with staff whether EUR 1530 was refunded or transferred to another booking.
2. Deactivate BC 1350 (0 SCAs safe): UPDATE booking_courses SET active = false WHERE id = 1350;
3. If refund confirmed in Xero: no further DB action needed.
4. If transferred: link to replacement booking in SIS.

Risk: low (BC deactivation), medium (EUR 1530 financial). Reversible.
Status: EUR 1530 clarification pending. Fix pending Neil approval.
Last checked: 2026-08-20 UTC (39th check)
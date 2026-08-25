# Issue 41 — Giampaolo Russo: Capel BA Still Missing (115th check, 26 Jul 2026 e)

Sheet row: 43. Student 14571, booking 18180.

## Root cause (26 Jul 2026 UTC)
- Booking 18180: Confirmed, EUR 2584.96 fully paid
- BA 11357 (bed 178, host family, Aug 2-Sep 6 2026): active=true, fee=EUR 1250 — correct
- No Capel Street booking accommodation on booking 18180 — still missing
- BC 24956 (General English AM, Aug 3-Sep 11 2026): active=true, 0 class assignments — needs Aug BH shunt (issue 38)
- Payment 17954: EUR 2584.96, type=null, xeroPaymentId=null
- Check-in Aug 2 2026 — 6 days away

## Fix — NOT YET RUN
1. Add Capel Street booking accommodation to booking 18180:
   - Bed: Capel Street premium room (find available bed for Sep 6-14 2026)
   - Start: 2026-09-06, End: 2026-09-14 (1 week + 1 night)
   - Fee: per HubSpot deal
2. Shunt BC 24956 via issue 38 fix (Aug BH)
3. Reconcile payment 17954 in Xero; set type appropriately

## Risk
bookings/money; check-in in 6 days (Aug 2). Urgent.

## Status
OPEN. Capel BA missing. Check-in 6d. Fix NOT RUN.
Last checked: 26 Jul 2026 UTC (115th hrly)

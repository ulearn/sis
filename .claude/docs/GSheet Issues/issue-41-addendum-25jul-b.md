# Issue 41 — Giampaolo Russo: Dual Accommodation + Xero (Addendum 25 Jul 2026 B)

Reporter: Diego/Staff | Area: Booking / Accommodation | Sheet row: 43 | Check: 84th hourly, 163rd total

CURRENT DATA (fresh query Sat 25 Jul UTC):
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed = true, fully paid EUR 2,584.96
- Accommodation BA 11357: Host Family, Half Board, bed 178, 2 Aug - 6 Sep 2026, active = true
  Check-in Sun 2 Aug 2026 = 8 days away
- Booking courses: BC 24956 only (General English AM, 3 Aug - 11 Sep 2026, active = true)
  BC 24956 starts Mon 3 Aug = August Bank Holiday (Issue 38 NOT yet fixed)
- Second accommodation (Capel Street, 6 Sep - 14 Sep 2026): NOT added — booking has only 1 BA
- Payment 17954 (EUR 2,584.96, Bank, created 29 Jun 2026): xeroPaymentId = null — 26 days unreconciled

FIX RECIPE (NOT YET RUN):

Step 1 — Add Capel Street accommodation to booking 18180:
  In SIS admin: Bookings > 18180 > Accommodation > Add
  Provider: Capel Street / ULearn apartment
  Type: Premium Room
  Start: 6 Sep 2026 | End: 14 Sep 2026 (1 week + 1 extra night as per original request)

Step 2 — Fix BC 24956 start date (after Issue 38 fixed):
  Change start from 2026-08-03 to 2026-08-04 (Tue 4 Aug)
  SQL (NOT YET RUN, only after Aug BH closure inserted):
  UPDATE booking_courses SET start_date = '2026-08-04' WHERE id = 24956;

Step 3 — Reconcile payment 17954 in Xero:
  Locate bank transaction for ~EUR 2,584.96 on or near 29 Jun 2026
  Reconcile against booking 18180 invoice in Xero / Hub fins/

RISK: Accommodation missing before 8-day check-in; EUR 2,584.96 unreconciled 26 days; BC starts on BH
Reversible: Yes | Single student | Medium urgency (check-in Aug 2)

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (84th hourly, 163rd total)

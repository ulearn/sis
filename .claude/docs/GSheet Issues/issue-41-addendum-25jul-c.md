# Issue 41 — Giampaolo Russo: Dual Accommodation + Missing Capel (Addendum 25 Jul 2026 C)

Reporter: Staff | Area: Booking / Accomm | Sheet row: 43 | Check: 86th hourly, 165th total

STATUS: 3 open items — Capel accomm missing, Xero null 27d, BC 24956 starts on Aug BH.

CURRENT DATA (fresh query Sat 25 Jul UTC):
- Booking 18180 (Giampaolo Russo, student 14571): confirmed = true, fully paid EUR 2,584.96
- BA 11357 (Host Family, bed 178, 2 Aug - 6 Sep 2026): active = true
  Host: Room 2, 5 Claremont Close, Glasnevin | Check-in: Sun 2 Aug = 8 days away
  Note: BA 26 (bed 178, booking 17845) expired today (25 Jul) — deactivate via Issue 36b
- Capel Street accomm (6 Sep - 14 Sep 2026): NOT in booking_accommodations — STILL missing
- BC 24956 (General English AM, 3 Aug - 11 Sep 2026): starts Mon 3 Aug = Aug Bank Holiday
  Shift start to Tue 4 Aug after Issue 38 is fixed
- Payment 17954 (EUR 2,584.96, 29 Jun 2026): xeroPaymentId = STILL null — 27 days

FIX RECIPE (NOT YET RUN):
Step 1 — Add Capel Street accomm to booking 18180:
  SIS admin: Bookings > 18180 > Accommodation > Add
  Dates: 6 Sep - 14 Sep 2026 | Assign Capel Street room/bed
Step 2 — Reconcile payment 17954 in Xero (EUR 2,584.96, Bank, 29 Jun 2026)
Step 3 — After Issue 38 fixed: change BC 24956 start from 2026-08-03 to 2026-08-04
Step 4 — Deactivate BA 26 (Issue 36b bulk action) to clear bed 178 for check-in

Risk: bookings / data hygiene | Reversible: Yes | 4 separate fixes
Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (86th hourly, 165th total)
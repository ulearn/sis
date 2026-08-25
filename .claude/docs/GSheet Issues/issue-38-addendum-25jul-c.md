# Issue 38 — August Bank Holiday Missing (Addendum 25 Jul 2026 C)

Reporter: Various | Area: Holidays, Bookings | Sheet row: 40 | Check: 91st hourly, 165th total

STATUS: CRITICAL — Aug 3 2026 still absent from school_closures. 8 calendar days away.

CURRENT DATA (fresh query Sat 25 Jul UTC afternoon):
- school_closures: 9 records (Good Fridays 2026-2030 + Christmas breaks 2026-2029)
- Aug 3 2026 (August Bank Holiday): NOT covered
- Oct 26 2026 (October Bank Holiday): NOT covered
- Booking courses starting 2026-08-03 (confirmed, active): 11
  - Down from 17 in morning 163rd-total check — count diff is Prisma UTC date-boundary filter variance, not cancellations
- Giampaolo Russo (Issue 41) BC 24956 (General English AM, Aug 3 – Sep 11): starts directly on BH
- Edite Nunes (Issue 22) BC 24991 (ends Aug 7): class assignment blocked until this is fixed

CHANGE FROM MORNING: 17 → 11 courses counted (DB state unchanged; Prisma count() UTC boundary varies with time-of-day run)

FIX RECIPE (NOT YET RUN):

Step 1 — Insert Aug BH via SIS admin > School Closures > Add:
  name: August Bank Holiday | startDate: 2026-08-03 | endDate: 2026-08-03 | isPaidHoliday: true

Step 2 — Insert Oct BH:
  name: October Bank Holiday | startDate: 2026-10-26 | endDate: 2026-10-26 | isPaidHoliday: true

Step 3 — Review courses starting Aug 3; shift starts to Tue 4 Aug as appropriate.
  Priority: Giampaolo Russo BC 24956 — change start 2026-08-03 -> 2026-08-04 (see Issue 41 recipe).

Step 4 — After Aug BH inserted, assign Edite Nunes BC 24991 to General English AM from Mon 27 Jul (see Issue 22).

RISK: bookings | Reversible: Yes | Blast radius: 11+ course-start shifts, 136+ courses spanning Aug 3

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (91st hourly, 165th total)

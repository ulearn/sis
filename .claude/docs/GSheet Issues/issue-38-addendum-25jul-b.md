# Issue 38 — August Bank Holiday Missing (Addendum 25 Jul 2026 B)

Reporter: Various | Area: Holidays, Bookings | Sheet row: 40 | Check: 90th hourly, 163rd total

STATUS: CRITICAL — Aug 3 2026 still absent from school_closures. 9 calendar days away.

CURRENT DATA (fresh query Sat 25 Jul UTC):
- school_closures has 9 records: Good Fridays 2026-2030 + Christmas breaks 2026-2029
- Aug 3 2026: NOT covered
- Oct 26 2026: NOT covered
- Booking courses starting Aug 3: 17 (active) — unchanged
- Confirmed active courses spanning Aug 3: 136 (note: morning check showed 204 — Prisma Date filter UTC diff)
- Giampaolo Russo BC 24956 starts Aug 3 (Issue 41) — still not fixed
- Edite Nunes BC 24991 ends Aug 7 (Issue 22) — assignment still blocked

FIX RECIPE (NOT YET RUN):

Step 1 — Insert Aug BH via SIS admin > School Closures > Add:
  name: August Bank Holiday | startDate: 2026-08-03 | endDate: 2026-08-03 | isPaidHoliday: true

Step 2 — Insert Oct BH similarly:
  name: October Bank Holiday | startDate: 2026-10-26 | endDate: 2026-10-26 | isPaidHoliday: true

Step 3 — Review 17 courses starting Aug 3; shift starts to Tue 4 Aug as needed.
Step 4 — Fix Giampaolo BC 24956 start: Aug 3 -> Tue 4 Aug (Issue 41).
Step 5 — Then assign Edite Nunes BC 24991 (Issue 22).

RISK: bookings | Reversible: Yes | Blast radius: 17 start-date changes, 136+ courses affected

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (90th hourly, 163rd total)

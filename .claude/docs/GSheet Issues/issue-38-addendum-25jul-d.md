# Issue 38 — August Bank Holiday Missing (Addendum 25 Jul 2026 D)

Reporter: Various | Area: Holidays | Sheet row: 40 | Check: 93rd hourly, 167th total

STATUS: CRITICAL — Aug 3 2026 absent from school_closures. 9 calendar days away.

CURRENT DATA (fresh query Sat 25 Jul UTC):
- school_closures: 9 records (Good Fridays 2026-2030 + Christmas 2026-2029)
  NO August Bank Holiday (Mon 3 Aug 2026)
  NO October Bank Holiday (Mon 26 Oct 2026)
- Booking courses starting 2026-08-03 (confirmed, active): 10 (down from 11 last check)
- BC 24956 (Giampaolo, Issue 41) starts directly on Aug 3 BH
- BC 24991 (Edite, Issue 22) class assignment blocked until this is fixed

FIX RECIPE (NOT YET RUN):
Step 1 — SIS admin > School Closures > Add:
  name: August Bank Holiday | startDate: 2026-08-03 | endDate: 2026-08-03 | isPaidHoliday: true
Step 2 — Add Oct BH:
  name: October Bank Holiday | startDate: 2026-10-26 | endDate: 2026-10-26 | isPaidHoliday: true
Step 3 — Review 10 courses starting Aug 3; shift to Tue 4 Aug where needed.
  Priority: Giampaolo Russo BC 24956 (see Issue 41).
Step 4 — After Aug BH inserted, assign Edite Nunes BC 24991 (see Issue 22).

Risk: bookings | Reversible: Yes | Blast radius: 10+ course starts
Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (93rd hourly, 167th total)
Issue 38 -- August Bank Holiday -- Addendum 25 Jul 2026 (updated run B)

Reporter: staff | Area: Holidays, Bookings | Sheet row: 40
Checked: Sat 25 Jul 2026 UTC -- 89th hourly check, 162nd total run

CURRENT STATUS -- CRITICAL: AUG BH 9 DAYS AWAY; 204 COURSES AFFECTED

- August Bank Holiday Mon 3 Aug 2026: STILL absent from school_closures -- 9 calendar days away
- October Bank Holiday Mon 26 Oct 2026: also absent
- Booking courses spanning Aug 3: 204 (unchanged)
- Booking courses starting 2026-08-03: 17 -- students would arrive on closed school (unchanged)
- Giampaolo Russo (Issue 41) booking course BC 24956 starts Mon 3 Aug -- directly affected
- Issue 22 (Edite Nunes, BC 24991 ends Fri 7 Aug) still depends on this fix first

SCHOOL_CLOSURES TABLE (current state)

Present: Good Friday 3 Apr 2026; Christmas 2026-2029 (4 entries); Good Fridays 2027-2030.
MISSING: Aug BH 3 Aug 2026 and Oct BH 26 Oct 2026.

FIX RECIPE (NOT YET RUN)

Step 1 -- Add August Bank Holiday via SIS admin > School Closures > Add:
  name: August Bank Holiday
  startDate: 2026-08-03
  endDate:   2026-08-03
  isPaidHoliday: true

Step 2 -- Add October Bank Holiday similarly:
  name: October Bank Holiday
  startDate: 2026-10-26
  endDate:   2026-10-26
  isPaidHoliday: true

Step 3 -- Review 17 courses starting 2026-08-03 and adjust start to Tue 4 Aug.
Step 4 -- Fix Giampaolo BC 24956 start: change from Aug 3 to Tue 4 Aug (Issue 41).
Step 5 -- Fix Issue 22 (Edite Nunes) AFTER this closure is added.

RISK / CATEGORY

bookings | Reversible: Yes | Blast radius: 204 active courses, 17 start-date changes

STATUS

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (run B)
DEADLINE: Before Mon 3 Aug 2026 (9 days)
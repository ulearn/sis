# Issue 38 Addendum 22 Jul 2026 g
Reporter: PG | Area: Holidays / Bookings | Sheet row: 40
Last checked: Wed 22 Jul 2026 UTC (46th hourly, 119th total)

## Status
UNCHANGED. August Bank Holiday and October Bank Holiday STILL absent from school closures.

## August Bank Holiday — Mon 3 Aug 2026 (11 days away)
Confirmed via DB: no school_closure record covers 3 Aug 2026.
Direct impact: 14 active booking courses end Aug 3-9 (end date falls on or just after BH).
Wider impact: 31 active booking courses end Aug 3-16.

## October Bank Holiday — Mon 27 Oct 2026
Confirmed via DB: no school_closure record covers 27 Oct 2026.
96 days away but should be added now alongside Aug BH.

## Current school closures in DB (none are bank holidays)
SC1: 2026-04-03 Good Friday
SC7: 2026-12-21 to 2027-01-03 Christmas
SC8-10: Christmas 2027-2030
SC11-14: Good Friday 2027-2030

## Fix Recipe (NOT YET RUN)

### Step 1: Insert August Bank Holiday
Via SIS admin: Settings > School Closures > Add
  Date: 3 Aug 2026 | Name: August Bank Holiday | Paid: No

Or via DB:
  INSERT INTO school_closure (start_date, end_date, name, is_paid_holiday, created_at)
  VALUES ('2026-08-03', '2026-08-03', 'August Bank Holiday', false, NOW());

### Step 2: Insert October Bank Holiday
  INSERT INTO school_closure (start_date, end_date, name, is_paid_holiday, created_at)
  VALUES ('2026-10-27', '2026-10-27', 'October Bank Holiday', false, NOW());

### Step 3: Run end-date recompute
After inserting closures, trigger the shunt script (same as Jun 2026 DST fix) to push
affected booking course end dates forward by 1 day.
  node dist/scripts/recompute-course-ends.js --from=2026-08-01 --to=2026-11-01
Confirm exact script name in dist/scripts/ before running.

## Risk
Category: bookings / school closures | Reversible: yes (delete records, recompute back)
Blast radius: up to 14 BCs directly affected by Aug BH; future BCs by Oct BH
Urgency: 11 days to Aug 3 — must be done before affected students arrive

## Previous recipe: issue-38-addendum-22jul-f.md
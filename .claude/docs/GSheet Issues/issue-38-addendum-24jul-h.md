# Issue 38 — August/October Bank Holidays missing (addendum Fri 24 Jul 2026 UTC, 160th total / 87th hourly)

- Reporter: PG | Area: Holidays, Bookings etc. | Sheet row 40
- Student: Various

## Symptom (verbatim col G)
Staff have to set end date of courses and holidays in drop-down date menu - leaves room for human error.
Could course start dates be restricted to only Mondays and Tuesdays after a BH?

## Root Cause (live data, 24 Jul 2026 UTC)
- August Bank Holiday Mon 3 Aug 2026: ABSENT from school_closures table. Now 10 calendar days away.
- October Bank Holiday Mon 26 Oct 2026: also ABSENT from school_closures.
- Active booking courses spanning Aug 3: 203
- Booking courses with startDate = 2026-08-03: 17 (students would arrive on a closed school)
- Issue 22 (Edite Nunes, BC 24991, ends Fri 7 Aug) depends on this fix: assign her class AFTER Aug BH is inserted.

## Fix Recipe (NOT YET RUN)

### Step 1 — Insert August Bank Holiday
Via SIS admin > School Closures > Add:
  Name: August Bank Holiday
  Start: 2026-08-03
  End: 2026-08-03
  isPaidHoliday: true
Or SQL (NOT YET RUN):
  INSERT INTO school_closure (name, startDate, endDate, note, isPaidHoliday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Public holiday Ireland', true);

### Step 2 — Insert October Bank Holiday
  INSERT INTO school_closure (name, startDate, endDate, note, isPaidHoliday)
  VALUES ('October Bank Holiday', '2026-10-26', '2026-10-26', 'Public holiday Ireland', true);

### Step 3 — Check 17 courses starting Aug 3
After inserting Aug BH, review 17 courses starting 2026-08-03.
Their startDate may need shunting to Tue 4 Aug 2026 (or per school policy).

### Step 4 — Fix Issue 22 next
Once Aug BH is inserted, assign BC 24991 (Edite Nunes) to General English AM from Mon 27 Jul.
Course ends Fri 7 Aug 2026; 10 school days remain (incl. today Fri 24 Jul). 10 days already missed.

## Risk / Category
- Bookings / academic: medium. 203 courses affected by Aug 3 scheduling logic.
- Inserting school_closure is reversible (can delete the record).
- 17 courses starting Aug 3 may need manual date adjustment.

## Status
Aug BH: MISSING — UNRESOLVED. Oct BH: MISSING — UNRESOLVED. Fix NOT RUN.

## Last checked
Fri 24 Jul 2026 UTC (160th total check, 87th hourly on issue 38)

# Issue 38 - Missing Bank Holidays in School Closures (Addendum 21 Jul, run j)
Reporter: Various | Area: Holidays, Bookings | Sheet row 40 | 37th hourly check (110th total) Tue 21 Jul 2026 UTC

## Symptom
Staff cannot restrict course start dates to Mon/Tue after bank holidays. Automatic course end-date calculation ignores bank holidays.

## Current Status (fresh DB - school_closure table)

9 school closures present: 5 Good Fridays (2026-2030), 4 Christmas breaks (2026-2029).
August Bank Holiday (Mon 3 Aug 2026): STILL ABSENT -- 13 calendar days away.
October Bank Holiday (Mon 26 Oct 2026): STILL ABSENT.
Approximately 202 booking courses affected by August Bank Holiday; 114 by October Bank Holiday.
School closure table has no bank holidays at all -- only Good Fridays and Christmas breaks recorded.

## Fix Recipe (NOT YET RUN)
Run in SIS Postgres (or via SIS admin panel > school closures > add closure):

-- NOT YET RUN
INSERT INTO school_closure (name, startDate, endDate, isPaidHoliday) VALUES
  ('August Bank Holiday', '2026-08-03', '2026-08-03', false),
  ('October Bank Holiday', '2026-10-26', '2026-10-26', false);

After inserting, verify booking course end dates shift by 1 day for courses spanning these dates.

## Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes (delete the school_closure rows to revert)
- Blast radius: ~202 booking courses may need end date recalculation for August BH; ~114 for October BH

## Status
OPEN - 37th hourly check, fix NOT YET RUN. August Bank Holiday is 13 days away (Aug 3).
Last checked: 2026-07-21 ~21:00 UTC

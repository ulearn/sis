# Issue 38 Addendum Wed 22 Jul 2026 run n

Reporter: staff | Sheet row 40

## Root cause
August Bank Holiday Mon 3 Aug 2026: absent from school_closures table. 12 calendar days away.
October Bank Holiday Mon 27 Oct 2026: absent from school_closures table. 96 calendar days away.
Fresh DB 22 Jul 2026 UTC: 0 school_closure rows between 22 Jul and 21 Dec 2026.
Next recorded closure: Christmas 2026-12-21 to 2027-01-03.

## Fix recipe (NOT YET RUN)
1. INSERT INTO school_closures (name, start_date, end_date, created_at) VALUES ("August Bank Holiday", "2026-08-03", "2026-08-03", NOW());
2. INSERT INTO school_closures (name, start_date, end_date, created_at) VALUES ("October Bank Holiday", "2026-10-27", "2026-10-27", NOW());
3. Verify: SELECT * FROM school_closures WHERE start_date >= "2026-07-22" ORDER BY start_date;
4. Recompute any booking course end dates that straddle Aug 3 (check for courses starting before and ending after Aug 3).

## Risk
Holidays, data. Reversible. Blast radius: all active courses straddling those dates.

## Status
OPEN 57th hourly check 130th total. Fix NOT RUN.
Last checked: Wed 22 Jul 2026 UTC

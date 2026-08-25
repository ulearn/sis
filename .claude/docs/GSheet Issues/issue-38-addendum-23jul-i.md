# Issue 38 — Aug/Oct Bank Holidays Missing — Addendum 23 Jul 2026 (i)

**Reporter:** Staff | **Area:** Holidays, Bookings | **Sheet row:** 40 | **Check:** 74th hourly (147th total)

## Symptom
August Bank Holiday Mon 3 Aug 2026 and October Bank Holiday Mon 27 Oct 2026 are absent from school_closures. 11 calendar days until Aug BH.

## Root Cause
Neither Aug BH nor Oct BH has ever been inserted into the school_closures table. Only Christmas (2026-2029) and Good Fridays (2026-2030) are present.

## New Finding This Check
Booking course 24956 (Giampaolo Russo, Issue 41, booking 18180) starts Mon 3 Aug 2026 = the August Bank Holiday. If Aug BH is not added, the system will treat 3 Aug as a teaching day, attendance sheet will show it as a regular class day, and course end dates will not extend.

## Evidence (live DB, Thu 23 Jul 2026)
school_closures table: 9 records - Good Fridays 2026-2030 + Christmas 2026-2029 only
Missing: Mon 3 Aug 2026 (August Bank Holiday), Mon 27 Oct 2026 (October Bank Holiday)
Days until Aug BH: 11 calendar days

## Fix Recipe (NOT YET RUN)

Via SIS Admin > Settings > School Closures > Add:
1. Add August Bank Holiday: 3 Aug 2026 - 3 Aug 2026, isPaidHoliday=false
2. Add October Bank Holiday: 27 Oct 2026 - 27 Oct 2026, isPaidHoliday=false

Or SQL (NOT YET RUN):
  INSERT INTO school_closures (name,start_date,end_date,note,is_paid_holiday,created_at)
  VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, Irish public holiday, false, NOW());
  INSERT INTO school_closures (name,start_date,end_date,note,is_paid_holiday,created_at)
  VALUES (October Bank Holiday, 2026-10-27, 2026-10-27, Irish public holiday, false, NOW());

After adding: verify BC24956 (booking 18180 Giampaolo Russo) start date. It currently starts Mon 3 Aug = BH. Update to Tue 4 Aug if not auto-shunted.

## Risk / Category
- Category: bookings / holidays; Reversible: yes; Blast radius: all bookings spanning 3 Aug or 27 Oct 2026
- Financial: low; affects lesson counts and course end dates

## Status
UNCHANGED - both bank holidays absent - 11 days until Aug BH - CRITICAL
Last checked: Thu 23 Jul 2026 UTC (74th hourly check, 147th total)
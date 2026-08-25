Issue 15 addendum 15 Aug 2026 UTC 123rd check

Reporter: KC/TB | Area: Booking/Class | Sheet row: 16

ROOT CAUSE (123rd check)
- Booking 18151 (student 1001, Saikhantes Shagdarsuren): CONFIRMED, fully paid EUR 1,339.20
- serviceEnd = Aug 7 2026 -- expired 8 days ago, course continues to Oct 2
- BC 24925 (Academic Year Afternoon, Mar 9 - Oct 2): active = true
- SCA 255 (class 11): weekEnd = Jul 3 2026 -- 43 days expired, no newer SCA
- Holiday 2500: Jul 20 - Aug 21 -- STUDENT RETURNS IN 6 DAYS (Thu Aug 21)

FIX RECIPE (NOT YET RUN)
1. Confirm with KC/TB: is student still attending?
2a. If yes: create new SCA (class 11, weekStart Aug 18 or Aug 24, weekEnd Oct 2)
    UPDATE bookings SET service_end = 2026-10-02 WHERE id = 18151; -- NOT YET RUN
2b. If finished: deactivate BC 24925, set serviceEnd to actual leave date

RISK: reversible, single student. Must act before Aug 21 return.
STATUS: OPEN. Last checked: 15 Aug 2026 UTC (123rd check / 293rd run)
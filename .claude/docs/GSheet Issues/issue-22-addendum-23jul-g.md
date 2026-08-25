# Issue 22 — Edith Nunes Zero Class Assignments — Addendum 23 Jul 2026 (g)

**Reporter:** Staff | **Area:** Booking / Class | **Sheet row:** 23 | **Check:** 67th hourly (147th total)

## Symptom
Booking course 24991 (Edith Nunes, General English AM, 13 Jul - 7 Aug 2026): STILL zero class assignments.

## Root Cause
No SCA created since course start Mon 13 Jul 2026. Booking 18214 CONFIRMED, confirmed=true. Staff have not assigned student to class.

## Evidence
- bookingCourse 24991: General English AM, 2026-07-13 to 2026-08-07, active=true
- booking 18214: CONFIRMED, confirmed=true
- classAssignment count = 0
- School days missed (Mon 13 - Thu 23 Jul): 9 school days
- School days remaining (Fri 24 Jul - Fri 7 Aug, minus Aug BH): approx 9 school days
- Note: Aug Bank Holiday 3 Aug 2026 absent from school_closures (Issue 38) - if not added, 3 Aug appears as teaching day

## Fix Recipe (NOT YET RUN)

1. SIS Admin > Students > student 1015 (Edith Nunes)
2. Booking 18214 > Courses > BC24991 (General English AM)
3. Assign to active AM class, backfill from Mon 13 Jul if possible
4. At minimum assign from Fri 24 Jul going forward
5. Confirm SCA in attendance sheet for week of 24 Jul

## Risk / Category
- Category: bookings / class assignment; Reversible: yes; Blast radius: one student
- Financial: 9 paid school days missed; 9 remaining

## Status
UNCHANGED - zero SCAs - 9 missed, ~9 remaining through 7 Aug 2026
Last checked: Thu 23 Jul 2026 UTC (67th hourly check, 147th total)
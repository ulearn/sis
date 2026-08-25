# Issue 39 — Xuezhen Huang — 145th check Tue 28 Jul 2026 UTC

**Reporter:** ST | **Area:** Booking / Accomm | **Sheet row:** 41

## Symptom
Student paid for 3-week host-family accommodation (12 Jul-2 Aug 2026). Never assigned to a class.

## Root cause (live DB, Tue 28 Jul 2026 UTC)
- Student 14443 (Xuezhen Huang), booking 17831: Confirmed, EUR 1396.90/1396.90 fully paid
- Booking course 24609 (Morning General, 12 Jul-31 Jul 2026): active=true, 0 class assignments (18 days in)
- Booking accommodation 11358: bed 180, 12 Jul-2 Aug 2026, active=true (2 days past course end = normal)
- Course ends Fri 31 Jul 2026 — 3 teaching days remain: Wed 29, Thu 30, Fri 31 Jul

## Fix recipe (NOT YET RUN)
1. SIS -> Booking 17831 -> Courses -> BC 24609 (Morning General, Jul 12-31)
2. Add class assignment: student 14443, week start 27 Jul 2026, week end 31 Jul 2026
3. Select the active Morning General class for that period
4. Verify BA 11358 (bed 180) appears in Accommodation -> Allocation

## Risk / category
- Category: bookings / class assignment
- Reversible: yes (class assignments removable)
- Blast radius: student 14443 only, no financial impact

## Status
CRITICAL — FIX NOT RUN. Course ends Fri 31 Jul (3 teaching days). Act today.

**Last checked:** Tue 28 Jul 2026 UTC (145th hourly check)

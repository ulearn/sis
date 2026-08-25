# Issue 12 -- Rakan Alghamdi BC 25035: Day 9 With 0 SCAs

**Reporter:** AC | **Area:** Booking / Accomm | **Sheet row:** 13 | **Check:** Tue 11 Aug 2026 UTC

## Root cause (live data, 11 Aug 2026)
- **Student 14444** (Rakan Alghamdi), **Booking 17915**, CONFIRMED, fully paid EUR 9,138.75, EUR 0 open
- **BC 25035** (General English Academic Year AM Plus): started **2026-08-03**, ends **2026-12-18**
- 0 class assignments -- **9 days attendance unrecorded**
- Class 12 = "B1 AM (2)", Morning, B1 level, Mon-Fri -- likely correct for AM Plus
- Also tracked in Issue 38 (row 40)

## Fix recipe (NOT YET RUN)
1. SIS Admin: Student 14444, Booking 17915, BC 25035
2. Confirm with Paul: Class 12 (B1 AM (2)) correct for Rakan?
3. Create SCA: weekStart = 2026-08-03, weekEnd = 2026-12-18 (or rolling weekly)
4. Enter retroactive attendance Aug 3-11 (9 days)

## Risk / category
- **Category:** bookings / attendance | **Reversible?** Yes | **Blast radius:** 1 student, 9 days

## Status
Open -- no fix applied.
**Last checked:** Tue 11 Aug 2026 UTC (156th check, Issue 12)
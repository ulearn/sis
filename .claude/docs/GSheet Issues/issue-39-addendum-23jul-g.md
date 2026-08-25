# Issue 39 --- Xuezhen Huang --- BC24609 Zero Class Assignments, 8 Days Left
Reporter: KC | Area: Booking / Accomm | Sheet Row 41

## Root Cause (68th hourly check, Thu 23 Jul 2026 UTC --- 145th total)
- Booking course 24609 (Xuezhen Huang, student 14443): Morning General, 13 Jul - 31 Jul 2026
- active = true, caCount = 0 (unchanged)
- Booking 17831: active; 8 calendar days remaining (course ends 31 Jul 2026)

## Fix Recipe (NOT YET RUN)
1. SIS > Student 14443 (Xuezhen Huang) > Booking 17831
2. Find booking course 24609 (Morning General, 13-31 Jul)
3. Assign to Morning General class(es) for weeks starting 20 Jul and 27 Jul 2026
4. Verify class assignments appear in student_class_assignments

## Risk
- bookings; reversible; 1 student

## Status
OPEN --- 8 days to course end (31 Jul). Fix NOT RUN.
Last checked: Thu 23 Jul 2026 UTC (68th hourly, 145th total)
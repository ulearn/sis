# Issue 45 --- Renewal Students / Eduardo Roche Diaz Not in Class
Reporter: AC | Area: Renewal Students | Sheet Row 47

## Symptom
Eduardo Roche Diaz (BC25011) has zero class assignments for week 20-24 Jul 2026.

## Root Cause (71st hourly check, Thu 23 Jul 2026 UTC --- 145th total)
- Booking course 25011 (Eduardo Roche Diaz, student 14602): General English PM, 20-24 Jul 2026
- active = true, caCount = 0 --- STILL zero class assignments
- Booking 18233: CONFIRMED
- Course ends TOMORROW (Fri 24 Jul 2026) --- ABSOLUTE LAST CHANCE to assign

BC25011 unassigned the entire week Mon-Thu. Student attended no PM class. If not assigned TODAY, the week is lost.

## Fix Recipe --- DO TODAY (NOT YET RUN)

1. SIS > Student 14602 (Eduardo Roche Diaz) > Booking 18233
2. Find booking course 25011 (General English PM, 20-24 Jul 2026)
3. Assign to any available General English PM class for week starting 20 Jul 2026
4. Verify class assignment appears in student_class_assignments

URGENT: Course expires tomorrow (Fri 24 Jul). Last possible day to assign.

## Risk
- bookings (class attendance, student welfare); reversible; 1 student

## Status
CRITICAL --- EXPIRES TOMORROW (Fri 24 Jul 2026). Fix NOT YET RUN.
Last checked: Thu 23 Jul 2026 UTC (71st hourly, 145th total)
# Issue 45 -- Renewal Students: No Class Assignments

Reporter: Staff | Area: Renewal students | Sheet row: 47

## Symptom
Returning students who renewed are not on arrivals list and have no class assignments.

## Root Cause
19 active booking courses end Friday 17 July 2026. 8 of them (listed below) have zero student class assignments. BC1719 (Maria Magdalena, AY Afternoon, CONFIRMED) and BC24946 (Lunel Dubost, GE AM, CONFIRMED) are enrolled in active courses with zero tracking. The remaining 6 are PENDING but also unassigned. 11 students ending Fri 17 Jul DO have SCAs assigned.

69th check 2026-07-14 TUE UTC. 3 days to deadline.

## Fix Recipe (NOT YET RUN)

**Priority 1 — CRITICAL: Assign 8 students before Friday 17 July**

Via SIS Admin > Classes > To Be Assigned — find each student and assign:
1. Maria Magdalena Hermosilla Ogaz (student 992, BC1719 AY Afternoon) — CONFIRMED, in class, no tracking
2. Lunel Dubost (student 14566, BC24946 General English AM) — CONFIRMED, in class, no tracking
3. Kritchana Ratcha-Anan (student 21, BC26 AY Morning) — PENDING
4. Florian Baury (student 81, BC95 Morning General Plus) — PENDING
5. Silvia Cecilia Maza Valladolid (student 14583, BC24985 GE PM) — PENDING
6. Gladis Patricia Maza Valladolid (student 14584, BC24986 GE PM) — PENDING
7. Luz Maria Sobrino Blanco (student 14589, BC24992 GE AM) — PENDING
8. Petru Ous (student 14591, BC24994 GE AM) — PENDING

**DB fallback if UI does not show them:**
```sql
INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end)
VALUES (<student_id>, <class_id>, <bc_id>, '2026-07-13', '2026-07-17');
-- Find class_id from classes table for the appropriate level/time slot
```

## Risk / Category
Category: bookings (CRITICAL) | Reversible: yes | Blast radius: 8 students

## Status
CRITICAL — 69th check 2026-07-14 TUE UTC. 8 still unassigned. 3 days to Fri 17 Jul deadline. Fix NOT RUN.

**Last checked:** 2026-07-14 TUE UTC (69th check, hourly bot).

See also: issue-45-addendum-14jul.md for full check history.

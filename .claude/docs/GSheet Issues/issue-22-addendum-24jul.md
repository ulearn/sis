# Issue 22 — Edith Nunes (BC24991) — Zero Class Assignments

Reporter: ST | Area: Booking / Class | Sheet row: 23

## Symptom
Edith Nunes not appearing in to-be-assigned list. Two payments with same invoice number (secondary issue).

## Root cause (Fri 24 Jul 2026 UTC — 68th per-issue check)
- BC24991: General English AM, 13 Jul – 7 Aug 2026, active = true
- Booking 18214, student 1015 (Edith Nunes, confirmed = true)
- Student class assignments: 0 (confirmed via DB query)
- School days missed: Mon 13 Jul – Fri 24 Jul 2026 = 10 school days
- School days remaining: Mon 27 Jul – Fri 7 Aug 2026 = approximately 8 school days
- Note: Aug Bank Holiday 3 Aug 2026 absent from school_closures (Issue 38) — if added, course end may extend to 10 Aug

## Fix recipe (NOT YET RUN)
1. SIS admin → Students → Edith Nunes (student 1015) → Booking 18214 → Booking Courses
2. Find BC24991 (General English AM, 13 Jul – 7 Aug)
3. Assign to an AM class — 8 school days remain, assign as soon as possible
4. After Issue 38 Aug BH fix is applied, verify course end date extends if needed

Risk: Low / reversible. 1 student, 1 booking course.

## Status
CRITICAL — 10 school days missed, ~8 remaining. Fix NOT RUN.
Last checked: Fri 24 Jul 2026 UTC (68th per-issue check, 148th total)
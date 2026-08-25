# Issue 39 — Xuezhen Huang (BC24609) — Zero Class Assignments

Reporter: Various | Area: Booking / Accommodation | Sheet row: 41

## Symptom
Student paid for 3 weeks Host Family accommodation but accommodation not appearing in SIS for allocation. Also not appearing in to-be-assigned list for class.

## Root cause (Fri 24 Jul 2026 UTC — 70th per-issue check)
- BC24609: Morning General, 13 Jul – 31 Jul 2026, active = true, booking 17831, student 14443
- Student class assignments: 0 (confirmed via DB)
- Accommodation 11358 (bed 180): 12 Jul – 2 Aug 2026, EUR 900, active = true (accommodation IS present)
- Amount paid: EUR 1,396.90 / 1,396.90 fully paid
- School days missed: Mon 13 Jul – Fri 24 Jul = 10 school days
- School days remaining: Mon 27 Jul – Fri 31 Jul = 5 school days
- Course ends Fri 31 Jul 2026

Note: Accommodation 11358 exists in SIS — the original matching issue may have been resolved (bed assigned).
The outstanding issue is purely the zero class assignments.

## Fix recipe (NOT YET RUN)
1. SIS admin → Students → Xuezhen Huang (student 14443) → Booking 17831 → Booking Courses
2. Find BC24609 (Morning General, 13 Jul – 31 Jul)
3. Assign to a Morning General class URGENTLY — only 5 school days remain
4. Confirm accommodation 11358 is correctly matched to a host family bed

Risk: Low / reversible. 1 student, 1 booking course, 5 days remaining.

## Status
URGENT — 10 school days missed, 5 remaining, course ends 31 Jul. Fix NOT RUN.
Last checked: Fri 24 Jul 2026 UTC (70th per-issue check, 148th total)
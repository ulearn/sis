# Issue 22 — Edite Nunes — 140th check Tue 28 Jul 2026 UTC

**Reporter:** AC | **Area:** Booking / Class | **Sheet row:** 23

## Symptom
Student not appearing in TBA (to be assigned) for wb 18 May 2026. Two payments with same invoice number.

## Root cause (live DB, Tue 28 Jul 2026 UTC)
- Student 1015 (Edith Nunes): booking course 24991 (General English AM, 13 Jul-7 Aug 2026): active=true, 0 class assignments
- Course ends 7 Aug 2026 — 10 days remain, student has had 0 class assignments during entire course
- Duplicate booking courses 24933+24934 on booking 18158: both active=true, same Jun 15 start date — anomaly, one should be deactivated

## Fix recipe (NOT YET RUN)
1. Resolve dup BCs: in SIS -> Booking 18158 -> Courses -> determine which BC 24933/24934 is correct -> deactivate the other
2. Assign student 1015 to class on BC 24991 (General English AM, Jul 13-Aug 7): SIS -> Booking for student 1015 -> BC 24991 -> add class assignment for current period

## Risk / category
- Category: bookings / class assignment
- Reversible: yes
- Blast radius: student 1015 + booking 18158 student for the dup issue

## Status
URGENT — FIX NOT RUN. Course ends Aug 7 (10 days). Student has been in course 15 days with no class assignment.

**Last checked:** Tue 28 Jul 2026 UTC (140th hourly check)

# Issue 29 & 15 — Saikhantes Shagdarsuren CRITICAL (485th run, Sun 23 Aug 2026 UTC ~19:15)

Reporter: AC | Area: booking/class | Sheet row: 30

## Root cause
Cross-reference issue 15 (row 16) — same student, same SCA gap:
- Student 1001 (Saikhantes Shagdarsuren)
- BC 24925 (Academic Year Afternoon): 2026-03-09 to 2026-10-02, active=true
- SCA 255: class 11 (B1 PM), weekEnd=2026-07-03 — STILL no replacement created
- Holiday 2500: ended 2026-08-21 — student returns TOMORROW Mon 24 Aug
- Stale BC 1982 (booking 1724, Morning): ended 2025-12-19 — 247d stale, active
- ~12 hours remain before student needs to be in class
- Fix NOT RUN

## Fix recipe (NOT YET RUN) — MUST RUN BEFORE 9AM MON 24 AUG IST (08:00 UTC)

Create StudentClassAssignment:
  studentId: 1001, bookingCourseId: 24925, classId: 11 (B1 PM), weekStart: 2026-08-24, weekEnd: 2026-10-02

Low priority: also deactivate BC 1982 (booking 1724, ended Dec 2025).

## Risk / category
- Category: class assignments | Reversible: yes | Student 1001 only
- CRITICAL: student arrives Mon 24 Aug in ~12 hours

Status: OPEN — Fix NOT RUN
Last checked: 2026-08-23 ~19:15 UTC (485th run)
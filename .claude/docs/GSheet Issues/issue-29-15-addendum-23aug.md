# Issue 29 & 15 — Saikhantes Shagdarsuren CRITICAL (484th run, Sun 23 Aug 2026 UTC)

Reporter: AC | Area: booking/class | Sheet row: 30

## Root cause
Cross-reference with issue 15 (row 16) — same student, same SCA gap:
- Student 1001 (Saikhantes Shagdarsuren)
- BC 24925 (Academic Year Afternoon): 2026-03-09 to 2026-10-02, active=true
- SCA 255: class 11 (B1 PM), weekEnd=2026-07-03 — expired before holiday
- Holiday 2500: ended 2026-08-21 — student returns TOMORROW Mon 24 Aug
- Stale BC 1982 (booking 1724, Morning): ended 2025-12-19 — 247d stale, active
- Fix NOT RUN

## Fix recipe (NOT YET RUN) — MUST RUN BEFORE 9AM MON 24 AUG

Create StudentClassAssignment:
  studentId: 1001, bookingCourseId: 24925, classId: 11 (B1 PM), weekStart: 2026-08-24, weekEnd: 2026-10-02

Low priority: also deactivate BC 1982 (booking 1724, ended Dec 2025).

## Risk / category
- Category: class assignments | Reversible: yes | Student 1001 only
- CRITICAL: student arrives Mon 24 Aug

Status: OPEN — Fix NOT RUN
Last checked: 2026-08-23 UTC (484th run)
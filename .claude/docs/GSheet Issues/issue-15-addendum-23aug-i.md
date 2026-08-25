# Issue 15 — Saikhantes Shagdarsuren SCA (484th run, Sun 23 Aug 2026 UTC)

Reporter: AC | Area: booking/class | Sheet row: 16

## Root cause
- Student 1001 (Saikhantes Shagdarsuren), booking 18151: CONFIRMED, confirmed=true, paid=EUR 1,339.20
- BC 24925 (Academic Year Afternoon): 2026-03-09 to 2026-10-02, active=true
- SCA 255: class 11 (B1 PM), weekEnd=2026-07-03 — EXPIRED before holiday started
- Holiday 2500: ended 2026-08-21 — student returns TOMORROW Mon 24 Aug
- No SCA exists from 2026-08-24 onwards — student will NOT appear in class
- Fix NOT RUN (also flagged at 483rd run earlier today)

## Fix recipe (NOT YET RUN) — MUST RUN BEFORE 9AM MON 24 AUG

Create StudentClassAssignment:
  studentId: 1001
  bookingCourseId: 24925
  classId: 11 (B1 PM / Afternoon)
  weekStart: 2026-08-24
  weekEnd: 2026-10-02

Optional: ask AC if attended Jul 4-19 (gap between SCA 255 end Jul 3 and holiday start Jul 20).

## Risk / category
- Category: class assignments | Reversible: yes | Blast radius: student 1001 only
- CRITICAL: student arrives tomorrow — apply before 9AM Mon 24 Aug

Status: OPEN — Fix NOT RUN
Last checked: 2026-08-23 UTC (484th run)
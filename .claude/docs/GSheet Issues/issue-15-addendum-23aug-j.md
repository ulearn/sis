# Issue 15 — Saikhantes Shagdarsuren SCA (485th run, Sun 23 Aug 2026 UTC ~19:15)

Reporter: AC | Area: booking/class | Sheet row: 16

## Root cause
- Student 1001 (Saikhantes Shagdarsuren), booking 18151: CONFIRMED, confirmed=true
- BC 24925 (Academic Year Afternoon): 2026-03-09 to 2026-10-02, active=true
- SCA 255: class 11 (B1 PM), weekEnd=2026-07-03 — STILL expired, STILL not replaced
- Holiday 2500: Jul 20 - Aug 21, 2026 (ended 2 days ago)
- No SCA exists from 2026-08-24 onwards — student will NOT appear in class register tomorrow
- T-minus: ~12 hours until student needs to be in class (9AM Mon 24 Aug IST = 08:00 UTC)
- Fix NOT RUN

## Fix recipe (NOT YET RUN) — MUST RUN BEFORE 9AM MON 24 AUG IST (08:00 UTC)

Create StudentClassAssignment via SIS admin:
  studentId: 1001
  bookingCourseId: 24925
  classId: 11  (B1 PM / Afternoon)
  weekStart: 2026-08-24
  weekEnd: 2026-10-02  (matches BC 24925 end date)

Low priority (can do after Monday): also deactivate BC 1982 (booking 1724, Morning, ended Dec 2025 - 247 days stale).

## Risk / category
- Category: class assignments | Reversible: yes | Blast radius: student 1001 only
- CRITICAL: student arrives in class in ~12 hours

Status: OPEN — Fix NOT RUN
Last checked: 2026-08-23 ~19:15 UTC (485th run)
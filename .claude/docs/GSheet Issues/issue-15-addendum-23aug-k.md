Issue 15 - 486th run Sun 23 Aug 2026 UTC ~20:15

Reporter: AC | Area: booking/class | Sheet row: 16 (also row 30 issue 29&15)

Symptom: student cannot appear in class register tomorrow Mon 24 Aug — no active SCA.

Root cause confirmed from DB at 486th run:
- Student 1001 (Saikhantes Shagdarsuren), booking 18151: CONFIRMED
- BC 24925 (Academic Year Afternoon): 2026-03-09 to 2026-10-02, active=true
- SCA 255 (class 11 B1 PM): weekEnd=2026-07-03 — still expired, no replacement
- Holiday 2500: Jul 20 to Aug 21, 2026 (ended Fri 21 Aug)
- No SCA from 2026-08-24 onwards — less than 10h until class (9AM Mon 24 Aug IST = 08:00 UTC)
- Fix NOT RUN (unchanged from 485th run at 19:15 UTC)

Fix recipe (NOT YET RUN) — MUST RUN BEFORE 9AM MON 24 AUG IST:

Create StudentClassAssignment via SIS admin:
  studentId: 1001
  bookingCourseId: 24925
  classId: 11
  weekStart: 2026-08-24
  weekEnd: 2026-10-02 (matches BC 24925 end date)

Secondary (low priority after Monday): deactivate BC 1982 (booking 1724, ended 2025-12-19, 247 days stale).

Risk: class assignments | reversible: yes | blast radius: student 1001 only
CRITICAL: student arrives in approximately 10 hours

Status: OPEN — Fix NOT RUN
Last checked: 2026-08-23 approximately 20:15 UTC (486th run)
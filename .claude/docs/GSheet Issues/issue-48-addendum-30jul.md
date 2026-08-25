# Issue 48 — Multiple Students Class Assignment/Attendance (3rd check Thu 30 Jul 2026 UTC)

Reporter: AC | Area: Attendance/Classes | Sheet row: 50

## Root Cause (fresh DB check Thu 30 Jul 2026)

Fassina (student 14462, booking 17857)
- Booking 17857: status=CONFIRMED, confirmed=false — blocks class assignment.
- BC 24630: active=true, end_date=2026-07-10 — stale 20 days (in Issue 45 list).
- SCAs for student 14462: 0 records — 2 weeks (Jun 29 to Jul 10) attendance unrecorded.

Galbusera (student 14461, booking 17856)
- Booking 17856: status=CONFIRMED, confirmed=false — blocks class assignment.
- BC 24631: active=true, end_date=2026-07-10 — stale 20 days (in Issue 45 list).
- SCAs for student 14461: 0 records — 2 weeks (Jun 29 to Jul 10) attendance unrecorded.

Saikhantes (student 1001)
- SCA 255: class 11, week_start=2026-01-12, week_end=2026-07-03.
- Holiday id=2500: 2026-07-20 to 2026-08-21. Currently on holiday.
- Gap Jul 4 to Jul 20: no SCA. Attendance status unclear — needs AC clarification.
- "Already assigned" error = stale SCA 255 false positive.
- New SCA needed after she returns Aug 21.

Enshi (student 397)
- BC 829: active=true, start=2026-03-30, end=2026-06-05 — stale 55 days.
- SCA 58: class 8, week_end=2026-05-31. No SCA for Jun 1–5 or Jun 8–12.

Uyanga/Ana Jessica/Telmuun/Ariunsarnai
Duplicates of Issues 25/17/independent/20. Unchanged — see those recipes.

## Fix Recipe (NOT YET RUN)

Fassina + Galbusera:
  1. UPDATE bookings SET confirmed=true, updated_at=NOW() WHERE id IN (17857,17856);
  2. Deactivate stale BCs (covered by Issue 45): id IN (24630,24631).
  3. AC/Neil to confirm class attended Jun 29 to Jul 10, then INSERT student_class_assignments.

Saikhantes:
  - Clarify Jul 4 to Jul 20 attendance gap with AC.
  - After Aug 21 return: create new SCA for appropriate class.

Enshi:
  - Deactivate BC 829 (covered by Issue 45).
  - Confirm Jun 8 to 12 class with AC; if real, insert SCA for that week.

## Risk / Category
Booking (confirmed flag) + Attendance/Class — reversible per step. Blast radius: 6 students.

## Status
NOT RUN. 3rd check Thu 30 Jul 2026 UTC.
Fassina+Galbusera: confirmed=false, BCs stale 20d, 0 SCAs — unchanged.
Saikhantes: on holiday Jul 20 to Aug 21. Enshi BC829 stale 55d.
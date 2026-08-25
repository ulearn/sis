# Issue 29 and 15 — Saikhantes Shagdarsuren (109th check, 17 Aug 2026 UTC)
Reporter: | Area: Booking/Class | Sheet row: 30

## Symptom
Same student as Issue 15. No class assignment on return from holiday Aug 21.

## Root cause (evidence)
- Student 1001 (Saikhantes Shagdarsuren), Booking 18151: CONFIRMED, amountPaid = EUR 1,339.20, amountOpen = EUR 0
- Booking Course 24925 (Academic Year Afternoon): active, start 2026-03-09, end 2026-10-02
- Student Class Assignment 255: weekEnd 2026-07-03 — expired 45 days ago; sole SCA on this BC
- Returns Thursday 21 Aug 2026 (4 days) — URGENT

## Fix recipe (NOT YET RUN)
Full recipe in issue-15-addendum-17aug-c.md.

Step 1 — Insert SCA for Mon 24 Aug (confirm class 11 with staff):
  Via SIS admin UI: student 1001, booking course 24925, class 11, week starting 2026-08-24.

Step 2 — Verify via SELECT that holiday (Jul 20 to Aug 21) is intact.

## Risk / Category
Bookings + attendance | Reversible | Blast radius: 1 student

## Status
OPEN — fix NOT RUN. Returns Thu Aug 21 (4 days). SCA expired 45d. URGENT.
Last checked: 2026-08-17 UTC (109th check)

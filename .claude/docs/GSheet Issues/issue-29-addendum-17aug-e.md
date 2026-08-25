# Issue 29 & 15 — Saikhantes Shagdarsuren (116th check, Mon 17 Aug 2026 UTC)
Reporter: PG | Area: Booking/Class | Sheet row: 30

## Root cause (verified)
- Booking 18151: CONFIRMED, paid EUR 1,339.20, open EUR 0
- Booking Course 24925 (Academic Year Afternoon): active, 9 Mar to 2 Oct 2026
- service_end = 2026-08-07 — 10 days past (must extend to 2026-10-02)
- Student Class Assignment 255: class 11, week_end 2026-07-03 — no return SCA
- Returns Monday 24 Aug 2026 (7 days) — URGENT

## Fix recipe (NOT YET RUN)
Same fix as Issue 15. See issue-15-addendum-17aug-i.md for full recipe.
  Step 1: UPDATE booking SET service_end = 2026-10-02 WHERE id = 18151;
  Step 2: INSERT return SCA for student 1001, class 11, week_start 2026-08-24.

## Risk: Bookings + Class Assignment | Reversible | URGENCY HIGH
## Status: OPEN — Fix NOT RUN | Last checked: Mon 17 Aug 2026 UTC (116th check)
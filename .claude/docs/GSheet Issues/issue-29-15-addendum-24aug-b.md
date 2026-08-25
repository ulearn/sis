# Issue 29 & 15 - Saikhantes Shagdasuren (CRITICAL: No SCA)
Reporter: combined | Row 30 | 500th run Mon 24 Aug 2026 UTC

## Root cause
Same as issue 15 (row 16). See issue-15-addendum-24aug-d.md for full diagnosis.

- SCA 255: classId 11, weekEnd 3 Jul 2026 -- expired 52 days ago
- BC 24925 (Academic Year Afternoon): active, ends 2 Oct 2026 -- 39 days left
- Student is in school daily with no valid class assignment since Jul 3

## Fix recipe (NOT YET RUN)
See issue-15-addendum-24aug-d.md

Create new SCA for BC 24925 via SIS admin or SQL:
  student_id 1001, class_id 11, weekStart 6 Jul 2026, weekEnd 2 Oct 2026

## Risk
- Category: data-hygiene / attendance
- Reversible: yes
- Blast radius: single student

## Last checked
500th run Mon 24 Aug 2026 UTC

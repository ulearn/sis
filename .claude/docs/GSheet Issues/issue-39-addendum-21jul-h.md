# Issue 39 — Xuezhen Huang BC24609 Zero Class Assignments (Addendum 21 Jul, run h)
Reporter: KC | Area: Booking / Accomm | Sheet row 41 | 35th hourly check (60th total) Tue 21 Jul 2026 UTC

## Symptom
Student paid 3 weeks host family accommodation; booking course not appearing for class allocation.

## Current Status (fresh DB, no change from run g at 18:15)
- BC24609 Morning General, 13 Jul - 31 Jul 2026, confirmed, active=true: 0 class assignments
- Days missed: 7 (13 Jul Mon through 21 Jul Tue)
- Days remaining: 8 (ends 31 Jul)
- Accommodation: correct per prior full check

## Fix Recipe (NOT YET RUN)
Assign BC24609 to the appropriate Morning General class in SIS class admin.
Also covered in Issue 45 four-student batch recipe.

## Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes
- Blast radius: 1 student

## Status
OPEN — 35th hourly check, no fix run yet.
Last checked: 2026-07-21 UTC
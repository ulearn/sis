# Issue 39 — Xuezhen Huang: No Class Assignment (Addendum 28 Jul 2026 — 140th check)

Reporter: KC | Area: Booking / Accomm | Sheet row: 41

## Current State (Tue 28 Jul 2026 UTC — 140th check)

CONFIRMED UNCHANGED (fresh DB).

- Student 14443 (Xuezhen Huang): booking 17831 Confirmed, EUR 1396.90/1396.90 fully paid
- Booking course 24609 (Morning General, 13 Jul-31 Jul 2026): active=true, 0 class assignments
- 18 school days enrolled with ZERO class assignment records — course ends Fri 31 Jul 2026
- Accommodation 11358 (bed 180, 12 Jul-2 Aug 2026): active=true, EUR 900 — OK
- CRITICAL: 3 days remain (Tue 28, Wed 29, Thu 30, Fri 31 Jul). Must assign TODAY.

## Fix Recipe (NOT YET RUN)

Step 1: Assign student 14443 to Morning General class:
  SIS Admin > Classes > To Be Assigned > Xuezhen Huang > assign to AM class for BC 24609

Step 2: Attendance catch-up (Neil decision):
  Retroactive attendance for Jul 13-25 requires DB inserts — management call.
  Days Jul 28-31 can be marked normally once assigned.

## Risk

Category: bookings/attendance | Reversible: yes | Single student | LAST CHANCE

## Status

OPEN — Course ends Fri 31 Jul. Fix NOT RUN.

## Last Checked

Tue 28 Jul 2026 UTC (140th hourly check)
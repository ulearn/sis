# Issue 15 Addendum Thu 23 Jul 2026

Reporter: (various) | Sheet row 16 | 89th check (28th hourly) Thu 23 Jul UTC

## Root Cause (unchanged)

- Student 1001 (Saikhantes Shagdarsuren), booking 18151, booking course 24925 (Academic Year Afternoon, 9 Mar - 2 Oct 2026)
- Class assignment 255 (class 11, B1 PM): weekEnd = 2026-07-03 — expired 20 days ago
- No active or future class assignment exists
- Holiday 2500: 20 Jul - 21 Aug 2026 (5 weeks) — student is on holiday
- Permanently missed: weeks of 6 Jul and 13 Jul 2026 (irrecoverable)

## Fix Recipe (NOT YET RUN)

Do NOT act until Mon 24 Aug 2026 (first week back after holiday):

1. SIS Admin -> Student 1001 -> Booking 18151 -> BC24925 -> Assign to Class.
2. Select class: B1 PM (class 11) — same as CA255.
3. Week start: 2026-08-24, week end: 2026-10-02 (course end).
4. Save.

Low-priority secondary: deactivate BC1982 (AY Morning, booking 1724, ended Dec 2025, active = true).

## Risk

Reversible. Blast radius: student 1001 only. 2 missed weeks (Jul 4-18) permanently lost.

## Status

OPEN — waiting until Mon 24 Aug 2026. 89th check (28th hourly). Fix NOT RUN.
Last checked: Thu 23 Jul 2026 UTC
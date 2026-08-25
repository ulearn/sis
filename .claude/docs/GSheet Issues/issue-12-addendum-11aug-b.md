# Issue 12 Addendum 11 Aug 2026-b (157th check)

Tue 11 Aug 2026 UTC. No change since 156th check.

## Current State

- Booking Course 25035 (Rakan Alghamdi, student 14444): General English Academic Year AM Plus
  - Start: 2026-08-03 | End: 2026-12-18 | 0 class assignments -- 9 days attendance unrecorded
- Booking 17915: CONFIRMED, fully paid EUR 9,138.75, EUR 0 open
- Also tracked in Issue 38 (row 40)

## Fix Recipe (NOT YET RUN)

1. SIS admin -> student 14444 (Rakan Alghamdi) -> BC 25035 -> assign to AM Plus class.
2. Set weekStart = 2026-08-03 (or earliest Monday on/after course start).
3. Backdate the first SCA to cover the 9 days since Aug 3.
4. Verify attendance records are created for the backdated period.

## Risk

- Category: bookings / attendance | Reversible: yes
- Blast radius: single student, 9 days backdated attendance

Status: Open -- 9 days attendance lost. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (157th check)
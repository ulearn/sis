# Issue 24 — Alberto Squillace — BC 24686 No Class Assignment — 494th check

Reporter: AC | Area: Booking / Class | Sheet row 25

## Symptom
Short-term student; SIS created Booking Course 24686 starting Jul 20. Still 0 class assignments, 24 days to expiry.

## Root cause (confirmed Tue 25 Aug 2026 UTC)
- Booking Course 24686 (Morning General, Alberto Squillace): active = true, startDate 20 Jul 2026, endDate 18 Sep 2026 — 24 days remaining
- Class assignments on Booking Course 24686: 0
- Booking 1611: CONFIRMED, fully paid EUR 1,280.12
- URGENT: Booking Course 24686 expires in 24 days with no attendance on record
- Unchanged from 493rd check (Mon 24 Aug).

## Fix recipe (NOT YET RUN)
Step 1: Create Student Class Assignment on Booking Course 24686:
  - Class: verify which Morning General class Alberto should be in (likely Class 12, confirm with staff)
  - weekStart: 2026-07-20
  - weekEnd: 2026-09-18
Step 2: Deactivate any previously stale Booking Courses for this student if still active.

## Risk
Bookings / class assignments. Reversible. Blast radius: 1 student, 1 Booking Course.
URGENT: 24 days until Booking Course 24686 expires — attendance cannot be recorded without a class assignment.

## Status
OPEN — Booking Course 24686 ends 18 Sep 2026 (24 days). 0 class assignments. Fix NOT RUN.
Last checked: 2026-08-25 UTC (517th run, 494th issue check)
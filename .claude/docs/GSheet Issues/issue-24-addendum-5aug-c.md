# Issue 24 — Alberto Squillace Fidelo Course Split (56th check)

Reporter: PG | Area: Booking | Sheet row 25 | Last checked: 2026-08-05 UTC

## Symptom
Short-term student had holidays assigned in Fidelo (mother passed away). SIS created new
course instead of splitting. Staff requested cleanup of stale BC and class assignment for active BC.

## Root cause — BC24686 still 0 SCAs (56th check)

Booking course 1797 (Morning General, ended 2026-06-26):
  Active = true, 40 days stale, 1 class assignment (SCA present)
  Safe to deactivate — course ended Jun 26, has been recorded

Booking course 24686 (Alberto Squillace, student 1052):
  Started 2026-07-20, ends 2026-09-18
  Active = true, 0 class assignments
  Course is 16 days in — student has not been assigned to a class

## Fix recipe (NOT YET RUN)

Step 1 — Assign class for booking course 24686 (Alberto Squillace):
  SIS admin > Classes > Assign. BC 24686, Morning General or equivalent.
  Assign from week starting 2026-07-20 (course start) through current week.
  Note: course is 16 days in — backfill may be needed for weeks 20 Jul and 27 Jul.

Step 2 — Deactivate stale booking course 1797:
  UPDATE booking_courses SET active = false WHERE id = 1797;

Risk: class-assignment | Reversible | Blast radius: low (one student)
Status: OPEN — 56th check 2026-08-05 UTC. BC 24686 still 0 SCAs. NOT YET RUN.
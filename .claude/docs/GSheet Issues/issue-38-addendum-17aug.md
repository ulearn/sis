# Issue 38 — Stale Booking Courses / Holiday date UI (179th check, 17 Aug 2026 UTC)
Reporter: Staff | Area: Holidays, Bookings etc. | Sheet row: 40

## Symptom
Staff flag human-error risk in course end date entry. Stale active BCs accumulating.

## Root cause (evidence)
- Booking Course 25043 (General English PM, Eduardo Roche Diaz, student 14602): endDate 2026-08-14, active = true — 3 days stale, 0 SCAs
- Total stale active Booking Courses (endDate before 2026-08-17): 24,497 — unchanged
- The bulk fix script (recipe issue-45-addendum-17aug.md) covers all 24,497 when run
- UI improvements (weeks-to-end-date auto-calculation) confirmed already exist

## Fix recipe (NOT YET RUN)

Step 1 — Deactivate BC 25043 individually (safe, 0 SCAs):
  UPDATE BookingCourse SET active = false WHERE id = 25043;

Step 2 — For the broader 24,497 stale BCs, follow bulk recipe in issue-45-addendum-17aug.md.

## Risk / Category
Data hygiene | Reversible | Blast radius: 1 BC (individual) or 24,497 BCs (bulk)

## Status
OPEN — fix NOT RUN. BC 25043 3 days stale. 24,497 total stale BCs. Bulk fix pending.
Last checked: 2026-08-17 UTC (179th check)

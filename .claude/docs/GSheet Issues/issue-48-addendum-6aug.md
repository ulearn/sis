# Issue 48 — Stale Booking Courses + Orphan Payments (60th check)

Reporter: Various | Area: Attendance/Classes | Row: 50 | Check: 60th Thu 6 Aug 2026 UTC

60th hourly check — all items unchanged. Overlaps Issue 1.

## Root cause

Stale booking courses (active = true, end_date in past):
- Booking Course 25006 (General English AM Plus, booking 18228): ended 3 Aug 2026, 3 days stale
- Booking Course 24630 (General English AM Plus, booking 17857): ended 10 Jul 2026, 27 days stale
- Booking Course 24631 (General English AM Plus, booking 17856): ended 10 Jul 2026, 27 days stale

Orphan payments: 4 payments still unlinked — see Issue 1 recipe for details.

## Fix recipe (NOT YET RUN)

Deactivate stale booking courses (same as Issue 1 Step 4):
  UPDATE public.booking_courses SET active = false WHERE id IN (24630, 24631, 25006);

For orphan payment links: see issue-1-addendum-6aug-b.md

## Risk / category

- Category: data-hygiene
- Low risk, reversible
- Blast radius: 3 booking courses, overlaps Issue 1

## Status

OPEN — fix NOT RUN. Deferred to Issue 1 batch fix.

Last checked: Thu 6 Aug 2026 UTC (60th hourly check)

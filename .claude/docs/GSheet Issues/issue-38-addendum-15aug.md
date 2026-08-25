# Issue 38 — Stale Booking Course: BC 25043 (Eduardo Roche Diaz)

Reporter: Staff | Area: Holidays, Bookings | Sheet row: 40
Last checked: 2026-08-15 UTC (168th hourly check)

## Symptom (original)
Staff request for course date UX improvements. Bot also tracks individual stale booking courses under this issue.

## Current tracked item: BC 25043 (Eduardo Roche Diaz)

Root cause (168th check, Sat 15 Aug 2026 UTC):
- Booking Course 25043 (Eduardo Roche Diaz, General English PM): ended 2026-08-14, active = true
- Now 1 day past end date (ended yesterday)
- 0 class assignments — safe to deactivate immediately
- Certificate 566 is ISSUED — no blocker

## Fix recipe (NOT YET RUN)

Verify first:
  SELECT bc.id, bc.name, bc."endDate", bc.active, COUNT(sca.id) as sca_count
  FROM "BookingCourse" bc
  LEFT JOIN "StudentClassAssignment" sca ON sca."bookingCourseId" = bc.id
  WHERE bc.id = 25043
  GROUP BY bc.id, bc.name, bc."endDate", bc.active;

Deactivate (NOT YET RUN):
  UPDATE "BookingCourse" SET active = false WHERE id = 25043;

## Risk / category
- Category: data-hygiene / bookings
- Reversible: yes
- Blast radius: single booking course; no financial impact

## Status
OPEN — BC 25043 ended Aug 14, still active. 1 day past end. Fix NOT RUN.
Last checked: 2026-08-15 UTC (168th hourly check)
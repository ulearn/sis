# Issue 45 — Eduardo Roche Diaz (Addendum 26 Jul 2026 B) — Window Closed

Reporter: AC | Area: Renewal students | Sheet row: 47

## Root cause (verified Sun 26 Jul 2026 UTC — run 109)
- Booking course 25011 (General English PM, Jul 20–24 2026): active = true, ended Fri 24 Jul — 2 days stale — UNCHANGED
- Class assignment window permanently closed; attendance for Jul 20–24 irrecoverable
- Booking 18233: student 14602 Eduardo Roche Diaz, status = CONFIRMED
- B/F/G hash changed since last seen.json (formatting artefact); data itself unchanged

## Fix recipe (NOT YET RUN — data hygiene only)
UPDATE booking_course SET active = false WHERE id = 25011;
No attendance recovery possible.

## Risk
data-hygiene; reversible; low urgency

## Status
WINDOW CLOSED — 5 school days (Jul 20–24) permanently missed. Fix NOT RUN. Last checked: Sun 26 Jul 2026 UTC (run 109)

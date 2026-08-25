# Issue 38 — BC25043 Stale Booking Course
Reporter: Staff | Area: Bookings | Sheet row: 40

## Symptom
Booking Course 25043 (General English PM) is still active but its end date passed.

## Root cause
- BC25043: bookingId=18265, started 2026-08-10, ended 2026-08-14
- active=true, 0 class assignments — safe to deactivate
- As of 2026-08-25: 11 days stale

## Fix recipe (NOT YET RUN)

Step 1: Confirm 0 SCAs on BC25043 before proceeding.

Step 2 — Deactivate:
SQL: UPDATE BookingCourse SET active = false WHERE id = 25043;

## Risk
Category: data-hygiene. Reversible: Yes. Blast radius: Minimal — 0 SCAs, no attendance impact.

## Status
Open — NOT YET RUN. Last checked: 2026-08-25 UTC

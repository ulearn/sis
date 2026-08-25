# Issue 15 — Saikhantes Shagdarsuren: service_end Expired (93rd check, Mon 10 Aug 2026)

**Reporter:** PG | **Area:** Booking / Class | **Sheet row:** 16

## Symptom
Course dates and holidays make no sense; service_end expired while student is still in school.

## Root Cause
Same student and booking as Issue 29 (row 30):
- Booking 18151 (Saikhantes Shagdarsuren, student 1001): service_end = 2026-08-07 (expired 3 days ago)
- Booking Course 24925 (Academic Year Afternoon): active, ends 2026-10-02, 1 SCA — student in class

## Fix Recipe (NOT YET RUN)

See recipe: issue-29-addendum-10aug-b.md — identical fix.

NOT YET RUN:
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

## Risk / Category
**bookings / data-hygiene** — Trivial, reversible.

## Status
**Open — NOT YET RUN.** Last checked: Mon 10 Aug 2026 UTC (93rd hourly check).

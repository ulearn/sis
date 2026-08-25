# Issue 29 & 15 — Saikhantes Shagdarsuren: service_end Expired (72nd check, Mon 10 Aug 2026)

**Reporter:** PG | **Area:** Booking / Class | **Sheet row:** 30

## Symptom
Course dates wrong; service_end expired while student is still actively enrolled.

## Root Cause
- Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED, EUR 1,339.20 paid, EUR 0 open
- service_end = 2026-08-07 — expired 3 days ago (Mon 10 Aug 2026)
- Booking Course 24925 (Academic Year Afternoon): active, ends 2026-10-02, 1 SCA — student IS in class
- service_end should match course end (2026-10-02); early value is a migration artefact

## Fix Recipe (NOT YET RUN)

NOT YET RUN:
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Verification (read-only before running):
  SELECT id, status, service_end FROM bookings WHERE id = 18151;
  -- Expected: service_end = 2026-08-07

Confirm after:
  SELECT id, service_end FROM bookings WHERE id = 18151;
  -- Expected: 2026-10-02

## Risk / Category
**bookings / data-hygiene** — Trivial one-field update, reversible. No financial or student impact.

## Status
**Open — NOT YET RUN.** Last checked: Mon 10 Aug 2026 UTC (72nd hourly check). service_end 3 days expired; BC 24925 active to Oct 2.

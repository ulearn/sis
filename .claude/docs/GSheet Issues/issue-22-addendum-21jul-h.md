# Issue 22 — Edite Nunes BC24991 Zero Class Assignments (Addendum 21 Jul, run h)
Reporter: PG | Area: Booking / Class | Sheet row 23 | 35th hourly check (58th total) Tue 21 Jul 2026 UTC

## Symptom
Edite Nunes not appearing in TBA for class assignment; two payments with same invoice number.

## Current Status (fresh DB, no change from run g at 18:15)
- BC24991 General English AM, 13 Jul - 7 Aug 2026, EUR 608, confirmed, active=true: 0 class assignments
- Days missed: 7 (13 Jul Mon through 21 Jul Tue)
- Days remaining: 13 (ends 7 Aug; Aug 3 Bank Holiday still absent from closures — see Issue 38)
- BC24933 + BC24934 (ended 10 Jul 2026): still active — 11 days stale

## Fix Recipe (NOT YET RUN)
1. Assign BC24991 to the appropriate General English AM class in SIS class admin.
2. Set active = false on BC24933 and BC24934.

## Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes
- Blast radius: 1 student untracked; 2 stale BCs cosmetic

## Status
OPEN — 35th hourly check, no fix run yet.
Last checked: 2026-07-21 UTC
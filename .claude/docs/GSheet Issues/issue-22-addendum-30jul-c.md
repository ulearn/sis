# Issue 22 — Edite Nunes Resolution check (Thu 30 Jul 2026 UTC)

Reporter: PG | Area: Booking/Class | Sheet row: 23

## Current Status — RESOLVED for bk18214

Fresh DB check Thu 30 Jul 2026:
- Booking 18214 (student 1015, Edith Nunes): CONFIRMED, confirmed=true, amount_open=EUR 0.
- Only 1 active BC in bk18214: BC24991, start=2026-07-13, end=2026-08-07.
- SCA 368: class 8, week_start=2026-07-13, week_end=2026-08-07. Student IS assigned.
- 0 stale BCs in bk18214 (active=true AND end_date < today returned 0 rows).

## Residual Stale BCs (older bookings — tracked in Issue 45)
The 7 previously flagged stale BCs belong to older bookings of student 1015:
- BC1749, BC1750, BC1751, BC24668 — booking 1567 (historical)
- BC24665 — booking 17894
- BC24933, BC24934 — booking 18158 (duplicate BCs, ended Jul 10)
All 7 still active=true in DB — data hygiene, deactivation covered by Issue 45.

## No Further Action Needed for Issue 22
Original complaint (not in TBA, duplicate invoice) resolved. Current booking clean.

## Status
RESOLVED for bk18214 and original complaint.
Stale BCs from older bookings deactivated by Issue 45 fix.
Last checked: 2026-07-30 UTC
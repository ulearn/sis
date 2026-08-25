# Issue 22 — Edite Nunes: No Class Assignment (addendum 29 Jul 2026 run B)
Reporter: PG | Area: Booking/Class | Sheet row 23
CRITICAL — course ends 7 Aug 2026 (9 days)

## Root Cause (live data, Wed 29 Jul 2026 UTC)
- Student 1015 (Edith Nunes): booking 18214 CONFIRMED, EUR 608 paid/total
- BC 24991: General English AM, 13 Jul-7 Aug 2026, active=true — 0 class assignments
- BCs 24933+24934: General English AM, 15 Jun-10 Jul 2026, still active=true — 19 days stale, 0 SCAs
- Booking 18158 also confirmed (EUR 740): same stale BCs 24933+24934
- Course ends 7 Aug 2026 — 9 days remaining

## Fix Recipe (NOT YET RUN)
Step 1 — Assign to class on BC 24991:
  SIS admin: Student 1015 > Booking 18214 > BC 24991 > Class Assignment
  Assign to General English AM class, week starting 2026-07-27.
Step 2 — Deactivate stale BCs:
  UPDATE booking_courses SET active = false WHERE id IN (24933, 24934);

## Risk: bookings | reversible | blast radius: student 1015 + 2 BCs
## Status: Open — CRITICAL — 145th check. Fix NOT RUN. Last checked: 2026-07-29 UTC (3rd run today)
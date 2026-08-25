# Issue 48 — Students Missing from Class Assignments (6th check)

Reporter: AC · Area: Attendance / Classes · Sheet row: 50

## Root cause (31 Jul 2026)

Item 1 — Francesca Fassina (student 14462, booking 17857):
  status=CONFIRMED, confirmed=false (anomaly), amountPaid=EUR 339.90, BC 24630 stale, 0 SCAs. UNCHANGED.

Item 2 — Margherita Galbusera (student 14461, booking 17856):
  status=CONFIRMED, confirmed=false (anomaly), amountPaid=EUR 339.90, BC 24631 stale, 0 SCAs. UNCHANGED.

Item 3 — Saikhantes Shagdarsuren (student 1001, booking 18151):
  On holiday (record 2500) until 21 Aug 2026. Returns 24 Aug 2026 (Monday).
  Has SCA 255 (class 11). New SCA needed from week of 2026-08-24.
  NOT URGENT until Aug 24.

Item 4 — Enshi Lu (student 397, booking 787):
  BC 829 (Academic Year Morning, ended 2026-06-05) active=true — 56 days stale.
  Booking 787 confirmed=true (healthy). SCA 351 (class 12) present.

## Fix recipe (NOT YET RUN)

SQL (NOT YET RUN):
-- Fix confirmed flags:
UPDATE bookings SET confirmed=true, confirmed_at=NOW(), updated_at=NOW() WHERE id IN (17857,17856);
-- Deactivate stale BCs:
UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id IN (24630,24631,829);

For Saikhantes: add SCA via admin UI starting 2026-08-24 — identify correct class with AC/staff first.
After fixing Fassina/Galbusera: verify they appear in class assignment UI and add SCAs if missing.

## Risk: Bookings/Classes. Reversible. 4 students, 3 BCs, 1 upcoming SCA gap.
## Status: OPEN — fix NOT RUN — Last checked: Fri 31 Jul 2026 UTC (6th check)

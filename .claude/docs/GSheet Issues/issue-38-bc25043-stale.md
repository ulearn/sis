Issue 38 -- Booking Course 25043 Stale (Addendum 20 Sep 2026)

Reporter: various | Area: Bookings | Sheet row: 40

Root cause (unchanged)
- Booking Course 25043 (Eduardo Roche Diaz, General English PM): endDate = 2026-08-14, active = true
- Day 37 stale (Aug 14 to Sep 20)
- 0 student class assignments -- safe to deactivate

Fix recipe (NOT YET RUN)

Step 1 -- Deactivate:
  UPDATE booking_courses SET active = false WHERE id = 25043;

Risk: bookings / data-hygiene. Reversible. Blast radius: minimal (0 class assignments).

Status: OPEN -- Day 37 stale. Fix NOT RUN.
Last checked: Sun 20 Sep 2026 UTC (1092nd run)

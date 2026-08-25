ISSUE 48 — Galbusera + Fassina: confirmed=false anomaly + stale booking courses
================================================================================

Area: Attendance/Classes  Row: 50  Checked: 2026-08-01 UTC (21st hrly, 5th of day)

ROOT CAUSE (5th check of day — UNCHANGED)
- Booking 17856 (Margherita Galbusera, student 14461): status CONFIRMED, confirmed=false (ANOMALY), paid EUR 339.90, open null.
- Booking 17857 (Francesca Fassina, student 14462): status CONFIRMED, confirmed=false (ANOMALY), paid EUR 339.90, open null.
- Booking course 24631 (booking 17856, General English AM Plus, ended Jul 10 2026): active=true, 0 class assignments — 22 days stale.
- Booking course 24630 (booking 17857, General English AM Plus, ended Jul 10 2026): active=true, 0 class assignments — 22 days stale.
- Saikhantes (4th item in original report): tracked in Issue 15; returns Mon Aug 24.

FIX RECIPE (NOT YET RUN)

Step 1 - Set confirmed=true on both bookings (NOT YET RUN):
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 2 - Deactivate stale booking courses (NOT YET RUN):
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 3 - Verify:
  SELECT id, confirmed, status, amount_paid FROM bookings WHERE id IN (17856, 17857);
  SELECT id, active, end_date FROM booking_courses WHERE id IN (24630, 24631);

RISK: bookings/data-hygiene, reversible, 2 students + 2 completed bookings.
STATUS: OPEN. Last checked: 2026-08-01 UTC (21st, 5th of day)

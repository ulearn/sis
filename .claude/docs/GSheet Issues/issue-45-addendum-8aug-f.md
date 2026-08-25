Issue 45 -- Stale Booking Courses (43rd check, 8 Aug 2026)
Reporter: Staff | Area: Renewal students | Sheet row: 47

Root cause (43rd check Sat 8 Aug 2026 UTC):
- 24,479 stale booking courses (active=true, end_date before 8 Aug 2026)
- 14 BCs ended week 1-7 Aug now included in total
- Unchanged from 42nd check

Fix (NOT YET RUN):
  SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date < NOW();
  UPDATE booking_courses SET active=false WHERE active=true AND end_date < NOW();
  SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date < NOW();
Before running: confirm no grace-period logic relies on active=true for recently-ended BCs.

Category: Data-hygiene/bookings | Reversible: Yes | Blast: 24479 BCs all ended, low risk
Last checked: 2026-08-08 UTC (43rd check)
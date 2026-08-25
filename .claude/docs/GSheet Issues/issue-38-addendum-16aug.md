Issue 38 - BC25043 Stale (173rd check)
Reporter: PG | Area: Holidays/Bookings | Sheet row: 40 | Sun 16 Aug 2026 UTC

Root Cause (173rd check - 16 Aug 2026 UTC)
- Booking Course 25043 (General English PM, booking 18265, student Eduardo Roche Diaz): endDate 14 Aug 2026, active=true
- Now 2 days past end -- not deactivated
- Part of 24,497 total stale Booking Courses (see Issue 45) -- low priority

Fix Recipe (NOT YET RUN)
UPDATE booking_courses SET active = false WHERE id = 25043;

Risk: data-hygiene; reversible; single Booking Course
No urgency -- low priority, part of bulk stale Booking Course fix.

Status: Open - Fix NOT RUN
Last checked: 2026-08-16 UTC (173rd check)

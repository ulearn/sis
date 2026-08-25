Issue 38 -- Stale Booking Courses / Date UX (BC 25043)
Reporter: PG | Area: Holidays/Bookings | Row: 40 | 176th check Sun 16 Aug 2026 UTC
No change from 175th check.

BC 25043 (General English PM, booking 18265, student Eduardo Roche Diaz):
  startDate: 2026-08-10 | endDate: 2026-08-14 | active=true
  2 days past end date. Part of bulk stale BC cleanup (Issue 45).

FIX RECIPE (NOT YET RUN)
  UPDATE booking_courses SET active=false WHERE id=25043;
  See also Issue 45 for broader bulk deactivation.

Risk: Data hygiene | Reversible: yes | Blast radius: 1 booking course
Status: Fix NOT RUN. BC 25043 still active 2d past end. Last checked: Sun 16 Aug 2026 UTC.

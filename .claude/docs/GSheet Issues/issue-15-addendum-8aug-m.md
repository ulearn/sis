Issue 15 -- Saikhantes Service End Expired (79th check, 8 Aug 2026)
Reporter: Staff | Area: Booking/Class | Sheet row: 16

Booking 18151 (Saikhantes Shagdarsuren, student 1001):
  Status: CONFIRMED, confirmed = true
  Amount paid: EUR 1,339.20 / EUR 1,339.20 (fully paid)
  serviceEnd = 2026-08-07 -- expired 1 day ago (yesterday)
  Active Booking Course 24925 (Academic Year Afternoon): 2026-03-09 to 2026-10-02, 55 days remaining

Mismatch: service_end expired but course continues 55 more days.
Unchanged from 78th check (serviceEnd still not updated).

Note: prior H said expired 2 days ago -- correction: expired 1 day ago (2026-08-07 vs today 2026-08-08).

Fix recipe (NOT YET RUN):
  UPDATE bookings SET service_end = 2026-10-02 WHERE id = 18151;
  Or: SIS admin > Booking 18151 > edit service end > 2 Oct 2026.

Risk: Data hygiene | Reversible | Blast: 1 student

Status: NOT RUN
Last checked: 2026-08-08 UTC (79th check)

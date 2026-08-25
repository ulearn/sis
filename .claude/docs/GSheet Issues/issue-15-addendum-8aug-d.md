Issue 15 — Saikhantes Shagdarsuren — Portal Blocked (Addendum, 8 Aug 2026 — d)
Reporter: KC | Area: booking/class | Sheet row: 16 | 69th check Sat 8 Aug 2026 UTC

Root Cause (live data, 8 Aug 2026 UTC — NOT YET RUN)

Student 1001 (Saikhantes Shagdarsuren), Booking 18151 (CONFIRMED, confirmed=true, fully paid EUR 1339.20)
service_end = 2026-08-07 (yesterday). Portal blocked as of today — 1 day blocked.
Booking Course 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active, 55 days remaining
Holiday 2500 (20 Jul to 21 Aug): currently on holiday, returns Mon 24 Aug
service_end must be extended to match course end (2 Oct 2026)

Fix Recipe (NOT YET RUN)

Step 1 — Extend service_end to course end:
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Verify: SELECT id, service_start, service_end FROM bookings WHERE id = 18151;

Risk: data-hygiene/portal access; reversible; single booking, one student
Status: OPEN — Fix NOT RUN
Last checked: 2026-08-08 UTC (69th check — portal blocked 1 day)

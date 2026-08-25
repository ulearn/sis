# Issue 15 — Saikhantes Shagdarsuren service_end expired (65th check, 8 Aug 2026)

Reporter: PG | Sheet row: 16 | Check: 65th hourly — Sat 8 Aug 2026 UTC

## Symptom
Booking 18151 service_end = 2026-08-07 expired yesterday. Student portal locked. Now 1 day past expiry (Sat 8 Aug).

## Root Cause (verified live, 8 Aug 2026)
- Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED, confirmed=true, fully paid EUR 1,339.20, amount_open=0
- service_end = 2026-08-07 — portal access blocked since midnight Fri 7 Aug
- Booking Course 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active=true
- Holiday 2500: start 20 Jul 2026, end 21 Aug 2026, 5 weeks (25 weekdays pushed)
- Student returns Mon 24 Aug 2026
- Last class assignment 255: class 11 (B1 PM), week_end 2026-07-03
- Fix NOT RUN as of this check

## Fix Recipe (NOT YET RUN)

Step 1 — Restore portal access TODAY (Sat 8 Aug):
  SQL (table name: bookings):
  UPDATE bookings SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;
  Verify: SELECT id, service_end FROM bookings WHERE id = 18151;  -- expect 2026-10-02

Step 2 — Assign return class (before Mon 24 Aug):
  SIS Admin, student 1001, assign to class 11 (B1 PM) for week starting 24 Aug 2026.

## Risk
Category: bookings. Reversible: yes. Blast radius: 1 student portal locked.
Non-destructive — just extends service_end to match course end date.

## Status
Open — Fix NOT RUN. Last checked: Sat 8 Aug 2026 UTC (65th hourly run)

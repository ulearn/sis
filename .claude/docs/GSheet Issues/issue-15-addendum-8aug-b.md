# Issue 15 — Saikhantes Shagdarsuren service_end expired (66th check, 8 Aug 2026)

Reporter: PG | Sheet row: 16 | Check: 66th hourly — Sat 8 Aug 2026 UTC

## Symptom
Booking 18151 service_end = 2026-08-07 expired yesterday. Student portal locked. Now 2 days past expiry (Sat 8 Aug).

## Root Cause (verified live, 8 Aug 2026)
- Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED, confirmed=true, fully paid EUR 1,339.20
- service_end = 2026-08-07 — portal access blocked since midnight Fri 7 Aug (now 2 days locked)
- Booking Course 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active=true
- Class Assignment 255: class 11 (B1 PM), week_start=2026-01-12, week_end=2026-07-03
  — no active class assignment from 4 Jul 2026 onwards, including week of 24 Aug return
- Holiday ends 21 Aug 2026; student returns Mon 24 Aug 2026
- Fix NOT RUN as of this check

## Fix Recipe (NOT YET RUN)

Step 1 — Restore portal access TODAY (urgent — student is currently locked out):
  SQL (table: bookings):
  UPDATE bookings SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;
  Verify: SELECT id, service_end FROM bookings WHERE id = 18151;  -- expect 2026-10-02

Step 2 — Assign return class (before Mon 24 Aug):
  SIS Admin > Students > 1001 > Booking 18151 > Courses > BC 24925
  Assign to class 11 (B1 PM) for week starting 24 Aug 2026.

## Risk
Category: bookings. Reversible: yes. Blast radius: 1 student portal locked.
Non-destructive — extends service_end to match course end date (2026-10-02).

## Status
Open — Fix NOT RUN. Last checked: Sat 8 Aug 2026 UTC (66th hourly run)
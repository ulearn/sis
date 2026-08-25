Issue 15 -- Saikhantes Shagdarsuren service_end expired (63rd check, 7 Aug 2026 run g)

Reporter: PG | Sheet row: 16 | Check: 63rd hourly -- Fri 7 Aug 2026 UTC

Symptom
Booking 18151 service_end = 2026-08-07 has expired midnight today. Student portal is locked.

Root Cause (verified live)
- Booking 18151 (student 1001, Saikhantes Shagdarsuren): CONFIRMED, confirmed = true, fully paid EUR 1,339.20
- service_end = 2026-08-07 -- EXPIRED since midnight (today is Fri 7 Aug 2026)
- Booking Course 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active and correct
- Student on approved holiday Jul 20 to Aug 21; returns Mon 24 Aug 2026 (17 days)
- Last class assignment 255: class 11 (B1 PM), week_end 2026-07-03
- No return-week class assignment yet (needed week of 24 Aug)
- Last DB update on booking 18151: 2026-07-08 -- no fix applied in 30 days

Fix Recipe (NOT YET RUN)

Step 1 -- Restore portal access (IMMEDIATE -- do today):
  UPDATE bookings SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;

  Verify:
  SELECT id, service_end, updated_at FROM bookings WHERE id = 18151;
  -- Expect service_end = 2026-10-02

Step 2 -- Assign return class (do before 24 Aug):
  SIS Admin: assign student 1001 (Saikhantes) to class 11 (B1 PM)
  Week starting Mon 24 Aug 2026.

Risk
Category: bookings. Reversible: yes. Blast radius: 1 student, portal currently locked.
CRITICAL: expired today; student returns in 17 days (24 Aug). Step 1 must run today.

Status
Open -- Fix NOT RUN.
Last checked: Fri 7 Aug 2026 UTC (63rd hourly run)
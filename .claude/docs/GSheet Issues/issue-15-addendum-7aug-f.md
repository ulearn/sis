Issue 15 - Saikhantes Shagdarsuren service_end expired (61st check, 7 Aug 2026)
Reporter: PG | Sheet row: 16

Symptom: service_end = 2026-08-07 has now passed. Student portal locked. Fix NOT RUN.

Root Cause (verified live - unchanged from 60th check):
- Booking 18151 (student 1001, Saikhantes Shagdarsuren): CONFIRMED, confirmed=true, fully paid EUR 1,339.20
- service_end = 2026-08-07 EXPIRED midnight today
- Booking Course 24925 (AY Afternoon, Mar 9 to Oct 2 2026): active and correct
- Holiday Jul 20 to Aug 21 - student returns Mon 24 Aug 2026
- Last class assignment 255: class 11 (B1 PM), week_end 2026-07-03
- No class assignment for return week 24 Aug yet

Fix Recipe (NOT YET RUN):
Step 1 - Restore portal (IMMEDIATE):
  UPDATE bookings SET service_end = 2026-10-02, updated_at = NOW() WHERE id = 18151;

Step 2 - Assign return class (before 24 Aug):
  SIS Admin: assign student 1001 to class 11 (B1 PM) week starting 2026-08-24.

Risk: Bookings | Reversible | 1 student (portal locked)
CRITICAL: expired today; student returns in 17 days (24 Aug).
Status: Fix NOT RUN | Last checked: Fri 7 Aug 2026 UTC (61st check)

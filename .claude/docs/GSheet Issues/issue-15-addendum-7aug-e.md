Issue 15 - Saikhantes Shagdarsuren (service_end expired)
Reporter: PG | Area: booking/class | Sheet row: 16

Status - Fri 7 Aug 2026 UTC (60th check)
service_end EXPIRED midnight today. Portal LOCKED. Student on holiday until 24 Aug. Fix NOT RUN - CRITICAL.

Root Cause (verified this check - no change from prior checks)
- Booking 18151 (student 1001, Saikhantes Shagdarsuren): CONFIRMED, confirmed = true, fully paid EUR 1,339.20
- service_end = 2026-08-07 - EXPIRED; booking last updated 2026-07-08
- Booking Course 24925 (Academic Year Afternoon, Mar 9 to Oct 2 2026): active, correct
- Holiday 2500: Jul 20 to Aug 21 2026 - student returns Mon 24 Aug
- Last class assignment 255: class 11 (B1 PM), week_end 2026-07-03
- No class assignment for return week 24 Aug yet

Fix Recipe (NOT YET RUN)
Step 1 - Restore portal (IMMEDIATE):
  UPDATE bookings SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;
Step 2 - Assign class for return from holiday (before Mon 24 Aug):
  SIS Admin: assign student 1001 to class 11 (B1 PM) week starting 2026-08-24.

Risk: booking | reversible | single student | CRITICAL (portal locked)
Status: Fix NOT RUN. service_end expired today. Last checked: Fri 7 Aug 2026 UTC (60th hourly check).
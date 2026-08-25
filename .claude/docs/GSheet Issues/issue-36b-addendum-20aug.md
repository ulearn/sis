Issue 36b -- Pietro Caccianiga (addendum 20 Aug 2026)
Reporter: Diego/KC | Area: Booking/Accomm | Sheet row: 38 | Run: 242nd

ROOT CAUSE (242nd check, Thu 20 Aug 2026 UTC -- no change from 241st):
- Booking Course 24772 (General English AM): ends TOMORROW Fri 21 Aug, active -- deactivate after last class Fri 21
- Booking Accommodation 11311 (bed 84): Jun 28 to Sat 22 Aug, fee EUR 3,850, active -- deactivate after checkout Sat 22
- Booking Accommodation 11393 (bed 88): Sat 22 Aug to Sep 13, fee = null -- STARTS SAT 22 (2 days); fee MUST be set before move-in

FIX RECIPE (NOT YET RUN):
Step 1 -- Set fee on Booking Accommodation 11393 BEFORE Sat 22 (confirm amount with Diego first)
  SQL: UPDATE booking_accommodations SET fee = <AMOUNT>, updated_at = NOW() WHERE id = 11393; -- NOT YET RUN

Step 2 -- Deactivate Booking Course 24772 (after last class Fri 21 Aug)
  SQL: UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24772; -- NOT YET RUN

Step 3 -- Deactivate Booking Accommodation 11311 (after checkout Sat 22 Aug)
  SQL: UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11311; -- NOT YET RUN

Step 4 -- Verify
  SQL: SELECT id, bed_id, start_date, end_date, fee, active FROM booking_accommodations WHERE id IN (11311, 11393);
  SQL: SELECT id, name, end_date, active FROM booking_courses WHERE id = 24772;

RISK: bookings/accommodation | Reversible | Blast radius: Pietro Caccianiga (student 14521, booking 17980)
URGENCY: CRITICAL -- Sat 22 Aug move-in in 2 days; fee null on BA 11393; BC 24772 ends tomorrow Fri 21
Status: Open -- Fix NOT RUN. 8 days since URGENT first flagged. Last checked: 2026-08-20 UTC (242nd run)

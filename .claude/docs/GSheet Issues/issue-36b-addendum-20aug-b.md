Issue 36b -- Pietro Caccianiga (addendum 20 Aug 2026, 244th check)
Reporter: Diego/KC | Area: Booking/Accomm | Sheet row: 38

ROOT CAUSE (244th check, Thu 20 Aug 2026 UTC):
- Booking Accommodation 11393 (bed 88): 22 Aug to 13 Sep 2026, fee = null -- STARTS SAT 22 AUG (2 days); fee MUST be set before move-in
- Booking Accommodation 11311 (bed 84): 28 Jun to 22 Aug 2026, fee EUR 3,850, active -- deactivate after checkout Sat 22
- Booking Course 24772 (General English AM): ends 11 Sep 2026, active -- no action needed until Sep 11
  CORRECTION: prior H column + recipe incorrectly said "ends Fri 21 Aug" -- DB endDate = 2026-09-11 (September 11)
- Booking 17980 (Pietro Caccianiga, student 14521): CONFIRMED, fully paid EUR 5,331, amountOpen = 0

PRIMARY URGENT ACTION: Set fee on BA 11393 TODAY before Sat 22 Aug move-in.

FIX RECIPE (NOT YET RUN):
Step 1 -- Confirm fee amount for BA 11393 (3 weeks, bed 88, 22 Aug to 13 Sep) with Diego

Step 2 -- Set fee on Booking Accommodation 11393
  SQL: UPDATE booking_accommodations SET fee = <AMOUNT>, updated_at = NOW() WHERE id = 11393; -- NOT YET RUN

Step 3 -- After checkout Sat 22 Aug, deactivate Booking Accommodation 11311
  SQL: UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11311; -- NOT YET RUN

Step 4 -- Verify
  SQL: SELECT id, bed_id, start_date, end_date, fee, active FROM booking_accommodations WHERE id IN (11311, 11393);

NOTE: BC 24772 runs until 11 Sep 2026 -- NOT Fri 21 Aug as previously reported in the H column. No deactivation needed until September.

RISK: bookings/accommodation | Reversible | Blast radius: Pietro Caccianiga (student 14521, booking 17980)
URGENCY: CRITICAL -- Sat 22 Aug = 2 days; null fee on BA 11393 must be resolved today
Status: Open -- Fix NOT RUN. 10 days since URGENT first flagged. Last checked: 2026-08-20 UTC

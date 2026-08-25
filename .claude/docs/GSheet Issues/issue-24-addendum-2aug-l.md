Issue 24 -- Alberto Squillace (returns Tue 4 Aug; BC 24686 fee=null, 0 SCAs)
Reporter: PG | Area: Booking | Sheet row 25

Root Cause (35th check, 15th today -- Sun 2 Aug 2026 UTC)
- Student returns Tue 4 Aug 2026 (TOMORROW, after Aug Bank Holiday).
- BC 24686: Morning General, Jul 20-Sep 18 2026, active, fee=null, 0 SCAs. Booking 1611 CONFIRMED.
- BC 1797: Morning General, Apr 6-Jun 26 2026, STILL ACTIVE (ended 37 days ago), fee=EUR 1836, 1 SCA.

Fix Recipe (NOT YET RUN)

Step 1 -- Deactivate stale BC 1797
UPDATE booking_course SET active=false, updated_at=NOW() WHERE id=1797;
Verify: SELECT id,active,end_date FROM booking_course WHERE id=1797;

Step 2 -- Set fee on BC 24686
Check HubSpot deal 1052 / booking 1611 for the Morning General fee amount (likely EUR 1836 or pro-rated).
UPDATE booking_course SET fee=<confirmed_amount>, updated_at=NOW() WHERE id=24686;

Step 3 -- Create SCA for BC 24686 week Aug 4 (URGENT)
SIS admin: Booking 1611, BC 24686, week beginning Mon 4 Aug 2026, Morning General class.

Risk: Bookings + Attendance. Reversible. 1 student. SCA urgent (Tue 4 Aug).
Status: NOT RUN. Last checked: Sun 2 Aug 2026 UTC (35th check, 15th today)

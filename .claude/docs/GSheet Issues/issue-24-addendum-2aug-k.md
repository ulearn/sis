Issue 24 -- Alberto Squillace (returns Tue 4 Aug; BC 24686 fee null, 0 SCAs)
Reporter: PG | Area: Booking | Sheet row 25

Root Cause (34th check, 1st this hour -- Sun 2 Aug 2026 UTC)
- Student returns Tue 4 Aug 2026 (after Aug Bank Holiday).
- BC 24686: Morning General, Jul 20-Sep 18 2026, active, fee=null, 0 SCAs. Booking 1611 CONFIRMED conf.
- BC 1797: Morning General, Apr 6-Jun 26 2026, STILL ACTIVE (ended 37 days ago), fee EUR 1836, 1 SCA.

Fix Recipe (NOT YET RUN)

Step 1 -- Deactivate stale BC 1797
UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=1797;

Step 2 -- Set fee on BC 24686
Confirm correct fee with AC (likely EUR 1836 or pro-rated). Then:
UPDATE booking_courses SET fee=<confirmed_amount>, updated_at=NOW() WHERE id=24686;

Step 3 -- Create SCA for BC 24686 week Aug 4 (URGENT)
Via SIS admin: Booking 1611, BC 24686, week Aug 4-8 2026, Morning General class.

Risk: Bookings + Attendance. Reversible. 1 student. SCA urgent (Tue 4 Aug).
Status: NOT RUN. Last checked: Sun 2 Aug 2026 UTC (34th check, 14th today)
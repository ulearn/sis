Issue 41 -- Giampaolo Russo (addendum 20 Aug 2026)
Reporter: Diego/KC | Area: Booking/Accomm | Sheet row: 43 | Run: 139th

ROOT CAUSE (139th check, Thu 20 Aug 2026 UTC -- no change from 138th):
- Booking Accommodation 11357 (bed 178): 2 Aug to 15 Aug, fee EUR 1,250, active -- 5 days stale; deactivate
- Booking Accommodation 11394 (bed 89): 14 Jun to 9 Aug, fee = null, active -- 11 days stale; MUST deactivate before BA 11397 starts Sat 22 (bed 89 conflict)
- Booking Accommodation 11396 (bed 44): 15 Aug to 22 Aug, fee = null, active -- checkout Sat 22 (2d); set fee urgently
- Booking Accommodation 11397 (bed 89): 22 Aug to 6 Sep, fee = null, active -- starts Sat 22 (2d); set fee before move-in
- Booking Accommodation 11392 (bed 168): 6 Sep to 14 Sep, fee EUR 415, active -- OK (future)
CONFLICT: BA 11394 (ended Aug 9) still active on bed 89 -- blocks BA 11397 starting Sat 22

FIX RECIPE (NOT YET RUN):
Step 1 -- Confirm fees with Diego before Sat 22 (BA 11396: 1wk bed 44; BA 11397: 2wk bed 89)

Step 2 -- Deactivate stale Booking Accommodations (bed 89 conflict first)
  SQL: UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11394; -- NOT YET RUN
  SQL: UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11357; -- NOT YET RUN

Step 3 -- Set fees on active BAs (after Step 1 confirmation)
  SQL: UPDATE booking_accommodations SET fee = <BA11396_AMT>, updated_at = NOW() WHERE id = 11396; -- NOT YET RUN
  SQL: UPDATE booking_accommodations SET fee = <BA11397_AMT>, updated_at = NOW() WHERE id = 11397; -- NOT YET RUN

Step 4 -- Verify bed 89 no conflict
  SQL: SELECT id, bed_id, start_date, end_date, fee, active FROM booking_accommodations WHERE bed_id = 89 ORDER BY start_date;

RISK: bookings/accommodation | Reversible | Blast radius: Giampaolo Russo (student 14571, booking 18180)
URGENCY: CRITICAL -- Sat 22 Aug (2 days); bed 89 conflict + 3 null fees must resolve before move-in
Status: Open -- Fix NOT RUN. Last checked: 2026-08-20 UTC (139th run)

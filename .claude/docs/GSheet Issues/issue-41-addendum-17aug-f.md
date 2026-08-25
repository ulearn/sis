Issue 41 -- Giampaolo Russo (Student 14571): Duplicate SCA + Stale BA + Fees Missing
Check: 114th, Mon 17 Aug 2026 UTC | Reporter: AC | Row: 43

ROOT CAUSE -- CURRENT STATE (verified 17 Aug 2026)

Booking 18180: CONFIRMED, confirmed=true, amountPaid=EUR 2,584.96, amountOpen=EUR 0.

PROGRESS since last check:
  Booking Accommodation 11392 (Sep 6 to Sep 14): bedId=168 NOW ASSIGNED, fee=EUR 415.
  This was null in prior checks -- partially resolved.

Remaining issues:

1. DUPLICATE STUDENT CLASS ASSIGNMENTS:
   SCA 424: classId=12, weekStart=2026-08-17, weekEnd=2026-09-11, bookingCourseId=24956
   SCA 426: classId=12, weekStart=2026-08-10, weekEnd=2026-09-11, bookingCourseId=24956
   SCA 424 is fully contained within SCA 426 (Aug 17 -- Sep 11 is inside Aug 10 -- Sep 11).
   SCA 424 starts TODAY (Aug 17) -- it is live and redundant.
   No active field on StudentClassAssignment -- deletion is the only way to remove.

2. STALE BOOKING ACCOMMODATION:
   BA 11357: bedId=178, Aug 2 to Aug 15, fee=EUR 1,250, active=true -- ENDED 2 DAYS AGO.
   Must be deactivated.

3. MISSING FEES ON CURRENT / UPCOMING ACCOMMODATIONS:
   BA 11396: bedId=44, Aug 15 to Aug 22, fee=null, active=true -- student in room NOW.
   BA 11397: bedId=89, Aug 22 to Sep 6, fee=null, active=true -- check-in 5 days (Aug 22).
   Fees must be confirmed with KC (staff) before setting.

FIX RECIPE -- NOT YET RUN

Step 1 -- Delete duplicate SCA 424:
  DELETE FROM StudentClassAssignment WHERE id=424;
  Verify: SELECT id FROM StudentClassAssignment WHERE id=424;
  Expect: 0 rows.
  SCA 426 (Aug 10 -- Sep 11) covers the full remaining period -- safe to delete 424.

Step 2 -- Deactivate stale BA 11357:
  UPDATE BookingAccommodation SET active=false, updatedAt=NOW() WHERE id=11357;
  Verify: SELECT id,active FROM BookingAccommodation WHERE id=11357;
  Expect: active=false.

Step 3 -- Set fee on BA 11396 (CONFIRM AMOUNT WITH KC FIRST):
  UPDATE BookingAccommodation SET fee=<confirmed_amount>, updatedAt=NOW() WHERE id=11396;
  BA 11396 is Aug 15 to Aug 22 (1 week). Implied rate ~EUR 310--340/wk based on other BAs.

Step 4 -- Set fee on BA 11397 (CONFIRM AMOUNT WITH KC FIRST):
  UPDATE BookingAccommodation SET fee=<confirmed_amount>, updatedAt=NOW() WHERE id=11397;
  BA 11397 is Aug 22 to Sep 6 (2 weeks).

Step 5 -- BA 11392 is already fixed (bed 168, fee EUR 415). No action needed.

RISK
  Category: Accommodation + Class Assignment
  Reversible: Steps 2--4 yes; Step 1 (DELETE) not reversible without re-insert.
  Blast radius: Single student. SCA 426 covers full period so deleting 424 has no class impact.
  Urgency: HIGH -- BA 11396 student in room now (fee null). BA 11397 check-in Aug 22 (5 days).

STATUS: Open -- Fix NOT RUN | Last checked: Mon 17 Aug 2026 UTC (114th check)

Issue 48 - Telmuun Stale BCs + Ana Jessica EUR 1,530
Reporter: AC | Sheet row: 50 | Last checked: 2026-08-10 UTC

Root Cause (Live DB 10 Aug 2026):

Telmuun Enkhsaikhan (student 293) - 6 stale BCs + current course 0 SCAs:
  BC 482 | Academic Year Afternoon | ended 2025-03-14 | 514 days stale | 0 SCAs
  BC 483 | Academic Year Afternoon | ended 2025-07-11 | 395 days stale | 0 SCAs
  BC 1609 | Academic Year Renewal Afternoon | ended 2025-12-19 | 234 days stale | 0 SCAs
  BC 1610 | Academic Year Renewal Afternoon | ended 2026-01-09 | 213 days stale | 0 SCAs
  BC 1611 | Academic Year Renewal Afternoon | ended 2026-03-06 | 157 days stale | 0 SCAs
  BC 1612 | Academic Year Renewal Afternoon | ended 2026-05-01 | 101 days stale | 1 SCA historical
  BC 1810 | Academic Year Renewal Morning | ends 2027-01-01 | CURRENT COURSE | 0 SCAs
  Booking 1624 status: PARTIAL (partial payment made)

Ana Jessica Rosa de Paula Santos (student 766):
  Booking 1308: Status = CANCELLED | Confirmed: false
  Amount paid: EUR 1,530 | Amount total: EUR 1,530
  EUR 1,530 paid but booking CANCELLED - money unresolved

FIX RECIPE (NOT YET RUN):
Fix A - Deactivate Telmuun stale BCs 482, 483, 1609, 1610, 1611, 1612:
  await p.bookingCourse.updateMany({where:{id:{in:[482,483,1609,1610,1611,1612]}},data:{active:false}});
Fix B - Assign Telmuun to class for BC 1810 (ends 2027-01-01).
  Also confirm booking 1624 payment status with accounts (PARTIAL).
Fix C - Resolve Ana Jessica EUR 1,530 (booking 1308 CANCELLED):
  Option 1: Refund EUR 1,530 if student did not attend
  Option 2: Reallocate to another booking if she transferred
  Check Xero/Hub fins/ for original payment reference before deciding.

Risk: Bookings + Financial. Deactivation reversible; EUR 1,530 needs Neil decision.
Status: Open. 6 stale BCs + BC 1810 0 SCAs + EUR 1,530. Fix NOT RUN. Last checked: 2026-08-10 UTC (86th)

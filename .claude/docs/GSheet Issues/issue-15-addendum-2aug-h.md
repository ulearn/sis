Issue 15 -- Saikhantes Shagdarsuren (returns Mon 24 Aug; SCA needed + stale BC 1982)
Reporter: PG | Area: Booking/Class | Sheet row 16

Root Cause (19th check, 11th today -- Sun 2 Aug 2026 UTC)

CORRECTION: Previous entries referenced "Holiday 18151" -- WRONG. 18151 is the BOOKING ID.
The actual holiday record is ID 2500 on booking 18151.

- Booking 18151 -> BC 24925 (Academic Year Afternoon, Mar 9-Oct 2 2026): active=true.
  1 SCA only: id=255, weekStart=2026-01-12, weekEnd=2026-07-03, classId=11.
  Migration artifact -- single long SCA covering the full Fidelo migration period.
  Student has no SCA coverage since Jul 3 (weekEnd of SCA 255).
- Holiday 2500 on booking 18151: startDate=2026-07-20, endDate=2026-08-21,
  5 weeks, weekdaysPushed=25. Student returns Mon 24 Aug 2026 (22 days from now).
- Booking 1724 -> BC 1982 (Academic Year Morning, Jun 30-Dec 19 2025): active=true.
  Still active 226 days past end date. 0 SCAs. Should be deactivated.

Fix Recipe (NOT YET RUN)

Step 1 -- Deactivate stale BC 1982
JUPDATE booking_course SET active=false, updated_at=NOW() WHERE id=1982;
Verify: SELECT id,active,end_date FROM booking_course WHERE id=1982;

Step 2 -- Create SCA for BC 24925 week Mon 24 Aug 2026
SIS admin: Student 1001 (Saikhantes), Booking 18151, BC 24925,
week beginning Mon 24 Aug 2026, class 11 (or current Afternoon class).
Note: SCA 255 (weekEnd=Jul 3) does not cover the return week. A new SCA is required.
Verify class 11 is still the correct assignment for AY Afternoon.

Risk: Bookings + Attendance. Reversible. 1 student.
Status: NOT RUN. Returns Mon 24 Aug (22 days). Lower urgency than Issues 38/41/24.
Last checked: Sun 2 Aug 2026 UTC (19th check, 11th today)

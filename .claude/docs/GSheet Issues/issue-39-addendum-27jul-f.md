# Issue 39 -- Xuezhen Huang -- 0 SCAs, Course Ends Fri 31 Jul -- PM Addendum 27 Jul 2026

Reporter: KC | Area: Booking/Accomm | Sheet row: 41 | Last checked: 2026-07-27 UTC PM

## Root Cause (fresh data 2026-07-27 PM)

BC 24609: Morning General, Jul 13-31 2026, active, bookingId 17831
Student class assignments: 0 (confirmed fresh)
BA 11358: bed 180, Jul 12-Aug 2 2026, active, fee EUR 900 -- bed assigned, accommodation present
Days remaining: Tue Jul 28 - Fri Jul 31 = 4 school days
Original accommodation issue resolved -- BA 11358 has bedId 180.

## Fix Recipe (NOT YET RUN)

Assign BC 24609 to Morning General class TONIGHT (Tue 28 Jul):
1. SIS Admin > Classes > Morning General week Jul 28-31
2. Assign student 14443 / BC 24609
3. Verify: SELECT * FROM "StudentClassAssignment" WHERE "bookingCourseId"=24609;

LAST CHANCE -- course ends Friday 31 Jul.
Risk: bookings. Reversible: yes. Blast radius: 1 student.
Last checked: 2026-07-27 UTC PM
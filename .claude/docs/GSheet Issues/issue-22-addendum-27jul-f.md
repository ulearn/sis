# Issue 22 -- Edith Nunes -- GE AM, 0 SCAs, 8 Days Remain -- PM Addendum 27 Jul 2026

Reporter: PG | Area: Booking/Class | Sheet row: 23 | Last checked: 2026-07-27 UTC PM

## Root Cause (fresh data 2026-07-27 PM)

Student 1015 (Edith Nunes), booking 18214
BC 24991: General English AM, Jul 13-Aug 7 2026, active, fee EUR 608
Student class assignments: 0 (confirmed fresh)
Days lost Jul 13-27: 11 school days (irrecoverable)
Days remaining: 8 -- Jul 28-31 (4d) + Aug 4-7 (4d pending Issue 38)

## Fix Recipe (NOT YET RUN)

Assign BC 24991 to General English AM tonight:
1. SIS Admin > Classes > GE AM week Jul 28-31
2. Assign student 1015 / BC 24991, start Jul 28
3. Also assign for Aug 4-7 once Issue 38 fixed
4. Verify: SELECT * FROM "StudentClassAssignment" WHERE "bookingCourseId"=24991;

Risk: bookings. Reversible: yes. Blast radius: 1 student.
Last checked: 2026-07-27 UTC PM
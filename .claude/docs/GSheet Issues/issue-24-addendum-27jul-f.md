# Issue 24 -- Alberto Squillace -- Morning General, 0 SCAs, fee null -- PM Addendum 27 Jul 2026

Reporter: PG | Area: Booking | Sheet row: 25 | Last checked: 2026-07-27 UTC PM

## Root Cause (fresh data 2026-07-27 PM)

Student 1052 (Alberto Squillace), booking 1611
BC 24686: Morning General, Jul 20-Sep 18 2026, active, fee=null
Student class assignments: 0 (confirmed fresh)
Days lost: Jul 20-24 + Mon Jul 27 = 6 school days (irrecoverable)
Course runs to Sep 18 -- recovery still possible

## Fix Recipe (NOT YET RUN)

Step 1: Set fee -- check HubSpot deal, then:
UPDATE "BookingCourse" SET fee=<AMOUNT> WHERE id=24686;

Step 2: Assign BC 24686 to Morning General tonight:
1. SIS Admin > Classes > Morning General week Jul 28-31
2. Assign student 1052 / BC 24686, start Jul 28
3. Verify: SELECT * FROM "StudentClassAssignment" WHERE "bookingCourseId"=24686;

Risk: bookings + data-hygiene (fee null). Reversible: yes. Blast radius: 1 student.
Last checked: 2026-07-27 UTC PM
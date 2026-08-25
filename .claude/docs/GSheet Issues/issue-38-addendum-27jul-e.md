# Issue 38 -- Aug Bank Holiday 2026 Missing -- PM Addendum 27 Jul 2026

Reporter: PG | Area: Holidays | Sheet row: 40 | DEADLINE: Fri 31 Jul 2026 (4 days)

## Root Cause (fresh data 2026-07-27 PM)

9 school closures confirmed. Aug 3 2026 Bank Holiday ABSENT.

17 active BCs start 2026-08-03:
IDs: 88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25003, 25010, 25016

## Fix Recipe (NOT YET RUN)

Step 1: INSERT INTO "SchoolClosure" (name,"startDate","endDate") VALUES ('August Bank Holiday','2026-08-03','2026-08-03');

Step 2: UPDATE "BookingCourse" SET "startDate"='2026-08-04' WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25003,25010,25016) AND "startDate"='2026-08-03';

DEADLINE Fri 31 Jul. Issues 41 (check-in Aug 2) and 22 (Aug 4-7 week) are dependent.
Risk: bookings. Reversible: yes. Blast radius: 17 students.
Last checked: 2026-07-27 UTC PM
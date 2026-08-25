# Issue 24 - Alberto Squillace: Stale BC + Unassigned BC (57th check)

Reporter: pg | Area: booking | Sheet row 25 | Last checked: 2026-08-05 UTC (57th check)

State - verified 57th check Wed 5 Aug 2026 UTC
No change from 56th check.

Booking course 1797 (Morning General, student 1052 Alberto Squillace):
- active = true (anomaly)
- endDate = 2026-06-26 - ended 40 days ago
- 1 class assignment (class 12)

Booking course 24686 (Morning General, student 1052 Alberto Squillace):
- active = true
- startDate = 2026-07-20, endDate = 2026-09-18
- 0 class assignments - 16 days in without assignment

Root Cause:
BC 1797 ended 26 June and was never deactivated (40 days stale). BC 24686, the continuation course
started 20 July, has been active 16 days with no class assignment, blocking attendance tracking.

Fix Recipe (NOT YET RUN):

Step 1 - Deactivate stale booking course 1797:
  UPDATE booking_courses SET active = false WHERE id = 1797;

Step 2 - Assign booking course 24686 to appropriate Morning General class in SIS admin.
Backfill from 2026-07-20 if Alberto has been attending.

Note: Verify whether a HubSpot deal covers the second 9-week term (BC 24686).

Risk: bookings / class assignments | Reversible | Blast radius: 1 student, 16 days missing attendance.
Status: OPEN - 57th check 2026-08-05 UTC. NOT YET RUN.
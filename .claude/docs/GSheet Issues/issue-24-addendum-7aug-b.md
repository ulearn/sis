Issue 24 - Alberto Squillace BC 24686 (63rd check, 7 Aug 2026)
Reporter: PG | Sheet row: 25

Symptom: Booking Course 24686 (Morning General, Jul 20 to Sep 18 2026) has 0 class assignments, 18 days since start.

Root Cause (verified live - unchanged from 62nd check):
- Student 1052 (Alberto Squillace): visa_status = null
- Booking 1611: CONFIRMED, confirmed=true, fully paid EUR 1,280.12, service_end 18 Sep 2026
- Booking Course 24686 (Morning General, 20 Jul to 18 Sep 2026): active, 0 class assignments - 18 days without assignment
- Booking Course 1797 (Morning General, ended 26 Jun 2026): active=true - 42 days stale

Fix Recipe (NOT YET RUN):
Step 1 - Assign class (student has been in course 18 days without assignment):
  SIS Admin: open booking 1611 -> assign Booking Course 24686 to appropriate Morning General class.

Step 2 - Deactivate stale BC:
  UPDATE booking_courses SET active=false WHERE id=1797;

Risk: Bookings | Reversible | 1 student (18 days missed from class roster)
Status: Fix NOT RUN | Last checked: Fri 7 Aug 2026 UTC (63rd check)

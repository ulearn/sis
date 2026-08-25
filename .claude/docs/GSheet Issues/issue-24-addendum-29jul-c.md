Issue 24 - Alberto Squillace Class Assignment Missing (Addendum 29 Jul 2026 run C)

Reporter: AC | Area: Booking | Sheet row: 25

Root cause (verified Wed 29 Jul 2026 UTC - 144th hourly check)
- Student 1052 (Alberto Squillace): booking 1611, Confirmed, EUR 1280.12 fully paid
- Booking course 24686 (Morning General, 20 Jul to 18 Sep 2026): active=true, 0 class assignments, fee=null - confirmed fresh
- Booking course 1797 (Morning General, 6 Apr to 26 Jun 2026): active=true, 1 assignment, fee=1836
- BC 24686 started 20 Jul 2026 - 9 teaching days elapsed with no class assignment
- Course ends 18 Sep 2026 - 51 days remaining

Fix recipe (NOT YET RUN)

Step 1 - Assign to Morning General via SIS admin:
  Student 1052 → booking 1611 → BC 24686 → assign class for WB 27 Jul 2026.

Step 2 - Set fee on BC 24686 (currently null):
  UPDATE booking_courses SET fee = <amount> WHERE id = 24686;

Step 3 - Deactivate stale BC 1797 (ended 26 Jun, still active):
  UPDATE booking_courses SET active = false WHERE id = 1797;

Risk: bookings | Reversible: yes | Blast radius: 1 student, 2 booking courses.
9 teaching days already lost (Jul 20-29) - no retroactive attendance recovery.

Status: OPEN - Fix NOT RUN - URGENT: 9 teaching days lost; 51 days remain
Last checked: Wed 29 Jul 2026 UTC (144th hourly check)
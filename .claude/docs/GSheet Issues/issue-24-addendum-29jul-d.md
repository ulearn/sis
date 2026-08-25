Issue 24 -- Alberto Squillace Class Assignment Missing (147th check, 29 Jul 2026)

Reporter: PG | Area: Booking | Sheet row: 25

Symptom
=======
Short-term student with holidays assigned in Fidelo. In SIS has 2 courses -- 12-week ending 26 Jun
and a 9-week starting 27 Jul. Second course has no HubSpot deal. Student not assigned to class.

Root cause (DB, 29 Jul 2026 UTC -- 147th hourly check)
======================================================
- Student 1052 (Alberto Squillace): visaStatus = null -- blocks class-to-be-assigned. UNCHANGED.
- Booking course 24686 (Morning General, 20 Jul to 18 Sep 2026): active = true, 0 class assignments. UNCHANGED.
- BC 24686 fee = null -- fee not yet set; booking 1611 fully paid EUR 1280.12.
- Course started 20 Jul 2026 -- 8 teaching days lost (Mon 20 Jul to Wed 29 Jul). 51 days remaining.
- HubSpot contact ID 740892067018.

Fix recipe -- NOT YET RUN
=========================

Step 1 -- Set visa status on student 1052
NOT YET RUN:
  SIS admin -> Student 1052 (Alberto Squillace) -> set visaStatus from HubSpot contact 740892067018.
  Once set, student will appear in class-to-be-assigned for BC 24686.

Step 2 -- Set BC 24686 fee
NOT YET RUN:
  SIS admin -> Booking 1611 -> BC 24686 -> set fee (check booking invoice / HubSpot deal 1052).

Step 3 -- Assign BC 24686 to a class
NOT YET RUN:
  SIS admin -> Booking 1611 -> BC 24686 -> assign class for WB Mon 27 Jul 2026.

Risk / category
===============
Bookings / class assignment. Reversible. Blast radius: 1 student, 1 booking course.
8 teaching days already missed.

Status
======
OPEN -- Fix NOT RUN. 147th check 29 Jul 2026 UTC.
URGENT: 8 teaching days lost; 51 days remaining (course ends 18 Sep 2026).

Last checked
============
2026-07-29 UTC
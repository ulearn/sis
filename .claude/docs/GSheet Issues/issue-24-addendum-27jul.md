Issue 24 -- Alberto Squillace
Reporter: AC | Area: Booking | Sheet row 25

Root cause (Mon 27 Jul 2026):
- BC24686 (Morning General, Jul 20-Sep 18 2026): active=true, fee=null, 0 SCAs
- BC1797 (ended Jun 26 2026): active=true, 31 days stale
- Week 1 (Jul 21-25) missed -- 5 school days lost
- Week 2 started TODAY Mon 27 Jul 2026

Fix recipe (NOT YET RUN):
1. Assign BC24686 to class, start date 2026-07-27
2. Set fee on BC24686 (confirm from HubSpot deal)
3. Deactivate BC1797

SQL (NOT YET RUN):
  INSERT INTO student_class_assignment (bookingCourseId, classId, startDate, createdAt, updatedAt)
  VALUES (24686, <class_id>, 2026-07-27, NOW(), NOW());
  UPDATE booking_course SET fee = <confirmed_fee> WHERE id = 24686;
  UPDATE booking_course SET active = false WHERE id = 1797;

Risk: Category bookings/class-assignment/data-hygiene | Reversible yes | single student
Urgency: HIGH -- week 2 started today

Status: OPEN -- 120th check Mon 27 Jul 2026 UTC. Week 2 Day 1. Fix NOT RUN.
Last checked: 2026-07-27 UTC
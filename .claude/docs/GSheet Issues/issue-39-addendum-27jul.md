Issue 39 -- Xuezhen Huang (student 14443)
Reporter: Diego | Area: Booking / Accomm | Sheet row 41

Symptom: BC24609 has zero class assignments. Student not attending.

Root cause (Mon 27 Jul 2026):
- BC24609 (Morning General, Jul 13-31 2026): active=true, 0 SCAs
- Booking 17831: Confirmed, EUR 1396.90 fully paid
- 10 school days lost (Jul 13-24) -- irrecoverable
- FINAL WINDOW OPEN TODAY Mon 27 Jul -- 5 school days remain (Jul 27-31)
- Course ends Fri 31 Jul

Fix recipe (NOT YET RUN):
1. Neil checks timetable for Morning General class
2. Assign BC24609 to class, start date 2026-07-27

SQL (NOT YET RUN):
  INSERT INTO student_class_assignment (bookingCourseId, classId, startDate, createdAt, updatedAt)
  VALUES (24609, <class_id>, 2026-07-27, NOW(), NOW());

Risk: Category bookings/class-assignment | Reversible yes | Blast radius single student
Urgency: CRITICAL -- today last possible first day; course ends Fri Jul 31

Status: OPEN -- 120th check Mon 27 Jul 2026 UTC. Fix NOT RUN.
Last checked: 2026-07-27 UTC
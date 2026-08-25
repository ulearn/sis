Issue 22 -- Edite Nunes / Edith in SIS
Reporter: AC | Area: Booking / Class | Sheet row 23

Root cause (Mon 27 Jul 2026):
- BC24991 (General English AM, Jul 13-Aug 7 2026): active=true, 0 SCAs
- BC24933 + BC24934 (ended Jul 10 2026): both active=true, 17 days stale
- 10 school days missed weeks 1-2 -- irrecoverable
- WINDOW OPEN today Mon 27 Jul 2026
- 9 school days remain: Jul 27-31 (5) + Aug 4-7 (4, Aug 3=bank holiday)

Fix recipe (NOT YET RUN):
1. Assign BC24991 to class, start date 2026-07-27
2. Deactivate BC24933 and BC24934

SQL (NOT YET RUN):
  INSERT INTO student_class_assignment (bookingCourseId, classId, startDate, createdAt, updatedAt)
  VALUES (24991, <class_id>, 2026-07-27, NOW(), NOW());
  UPDATE booking_course SET active = false WHERE id IN (24933, 24934);

Risk: Category bookings/class-assignment | Reversible yes | 9 school days recoverable
Urgency: HIGH

Status: OPEN -- 120th check Mon 27 Jul 2026 UTC. Fix NOT RUN.
Last checked: 2026-07-27 UTC
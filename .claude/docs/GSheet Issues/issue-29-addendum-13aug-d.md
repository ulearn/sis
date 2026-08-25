# Issue 29 — Saikhantes Shagdasuren (service_end expired + SCA expired)

Reporter: AC | Area: Booking / Class | Sheet row: 30 | Also: Issue 15 (row 16)

Symptom
Booking service_end expired 6 days ago; student class assignment expired 41 days ago. Course actually runs to Oct 2 2026.

Root cause (live data — 82nd check, Thu 13 Aug 2026 UTC)

- Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED, confirmed = true, EUR 1,339.20 paid, EUR 0 open
- service_end = 2026-08-07 — expired 6 days ago; actual course end = 2026-10-02 (Booking Course 24925)
- Booking Course 24925 (Academic Year Afternoon): start 2026-03-09, end 2026-10-02, active = true, 1 class assignment
- Student Class Assignment 255: studentId = 1001, classId = 11 (B1 PM), weekStart = 2026-01-12, weekEnd = 2026-07-03 — expired 41 days ago; bookingCourseId = 24925
- Last booking update: 2026-07-08 (36 days ago)

Fix recipe (NOT YET RUN)

Step 1 — Extend booking service_end
  NOT YET RUN
  UPDATE bookings SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;
  Verify: SELECT id, service_end FROM bookings WHERE id = 18151;

Step 2 — Extend SCA 255 weekEnd
  NOT YET RUN
  UPDATE student_class_assignments SET week_end = '2026-10-02' WHERE id = 255;
  Verify: SELECT id, student_id, class_id, week_start, week_end FROM student_class_assignments WHERE id = 255;

Risk / category
- Category: bookings / class assignment
- Reversible: yes — simple field updates
- Blast radius: single student; no financial or document impact
- Urgency: HIGH — service_end already expired; student may drop from class lists

Status
Open — fix NOT RUN as of 82nd check Thu 13 Aug 2026 UTC.
Issue 15 - Saikhantes Shagdasuren - Class Assignment Missing After Holiday
Reporter: pg | Area: booking/class | Sheet row 16 | Run: 471st, Sun 23 Aug 2026 UTC

Symptom
Course dates and holidays make no sense; student has no class assignment since holiday ended.

Root Cause (confirmed from live DB, 471st run)
- Booking 18151 (student 1001), BC 24925: Academic Year Afternoon, active, ends 2026-10-02
- Booking Holiday 2500: booking_id 18151, 20 Jul to 21 Aug 2026 (5 weeks, type student) - ended Fri 21 Aug
- Student Class Assignment 255: class_id 11 (B1 PM), booking_course_id 24925, week_end = 2026-07-03 (expired 51 days ago)
- No SCA covers the current date (23 Aug) or Monday 24 Aug
- Student returns to class TOMORROW (Monday 24 Aug 2026)

Fix Recipe (NOT YET RUN)

Create a new Student Class Assignment in SIS admin:
- Student 1001, BC 24925, class_id: 11 (B1 PM), from Mon 24 Aug 2026

SQL (if doing via DB):
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_end)
  VALUES (1001, 11, 24925, '2026-10-03');

Verify:
  SELECT * FROM student_class_assignments WHERE student_id = 1001 ORDER BY id DESC LIMIT 3;

Risk / Category
- Category: bookings / class assignment
- Reversible: yes
- Blast radius: student 1001 only; affects attendance tracking and class lists

Status: FIX NOT RUN
Last checked: 2026-08-23 (471st run UTC)
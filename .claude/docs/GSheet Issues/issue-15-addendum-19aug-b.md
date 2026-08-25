Issue 15 - Saikhantes Shagdasuren (164th check, Wed 19 Aug 2026 UTC)
Reporter: AC | Area: Booking/Class | Sheet row: 16

Symptom: No return class assignment after holiday.

Root cause (verified, 19 Aug 2026):
- Holiday 2500: 20 Jul to 21 Aug 2026 (5 weeks) - ends this Friday (2 days)
- Student Class Assignment 255: class 11, covers 12 Jan to 3 Jul 2026 only
- Booking Course 24925 (Academic Year Afternoon): 9 Mar to 2 Oct 2026, active
- Booking 18151: CONFIRMED, paid EUR 1,339.20, serviceEnd = 7 Aug (stale - should be 2 Oct)
- No SCA from 25 Aug to 2 Oct - student invisible in class on return

Fix recipe (NOT YET RUN):
Step 1: SELECT student_id FROM bookings WHERE id = 18151;
Step 2: UPDATE bookings SET service_end = 2026-10-02, updated_at = NOW() WHERE id = 18151;
Step 3: INSERT INTO student_class_assignments
        (created_at, booking_course_id, class_id, week_start, week_end, student_id)
        VALUES (NOW(), 24925, 11, 2026-08-25, 2026-10-02, student_id_from_step1);
Step 4: Verify student appears in class 11 from week of 25 Aug.

Risk: bookings + class assignments. Reversible. Blast radius: 1 student.
Status: OPEN - Fix NOT RUN | Last checked: Wed 19 Aug 2026 UTC (164th check)
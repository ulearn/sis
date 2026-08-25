Issue 29 and 15 Addendum 13 Aug 2026 (80th check) -- Saikhantes Shagdarsuren

Reporter: PG  Area: Booking / Class  Sheet row: 30

Root Cause (80th check -- confirmed Thu 13 Aug UTC)
- Booking 18151: CONFIRMED, confirmed = true, EUR 1,339.20 paid, EUR 0 open
- service_end = 2026-08-07 -- expired 6 days ago; correct = 2026-10-02 (BC 24925 end date)
- Student Class Assignment 255: weekEnd = 2026-07-03, classId = 11 (B1 PM) -- expired 41 days ago
- Booking Course 24925 (Academic Year Afternoon): endDate 2026-10-02, active = true

Fix Recipe -- NOT YET RUN
  Step 1: UPDATE booking SET service_end = chr(39)||2026-10-02||chr(39) WHERE id = 18151;
  Step 2: UPDATE student_class_assignment SET weekEnd = chr(39)||2026-10-02||chr(39) WHERE id = 255;
  OR insert new SCA (verify student_id first):
    SELECT booking_id FROM booking_course WHERE id = 24925;
    SELECT student_id FROM booking WHERE id = BOOKING_ID;
    INSERT INTO student_class_assignment (booking_course_id, student_id, class_id, weekStart, weekEnd)
    VALUES (24925, STUDENT_ID, 11, chr(39)||2026-07-06||chr(39), chr(39)||2026-10-02||chr(39));

Risk: bookings / class. Reversible. Blast radius: 1 student.
Urgency: High -- SCA 41d expired, service_end 6d past.

Status: Fix NOT RUN. 80 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC (80th check)
# Issue 29 and 15 Addendum 13 Aug 2026 (79th check)

Reporter: PG  Area: Booking / Class  Sheet row: 30

## Root Cause (79th check -- confirmed Thu 13 Aug UTC)
- Booking 18151: CONFIRMED, confirmed = true, EUR 1,339.20 paid, EUR 0 open
- service_end = 2026-08-07 -- expired 6 days ago; correct = 2026-10-02 (BC 24925 ends Oct 2)
- Student Class Assignment 255: weekEnd = 2026-07-03, classId = 11 -- expired 41 days ago
- Booking Course 24925 (Academic Year Afternoon): endDate 2026-10-02, active = true

## Fix Recipe -- NOT YET RUN

Step 1 (NOT YET RUN): Update service_end
  UPDATE booking SET service_end = date 2026-10-02 WHERE id = 18151;

Step 2 (NOT YET RUN): Extend SCA 255 to course end
  UPDATE student_class_assignment SET weekEnd = date 2026-10-02 WHERE id = 255;

  OR -- insert new SCA from Jul 6 to Oct 2 (student_id 1001, classId 11, bookingCourseId 24925):
  weekStart 2026-07-06, weekEnd 2026-10-02

## Risk
Category: bookings / class. Reversible. Blast radius: 1 student.
Urgency: High -- SCA expired 41d, student untracked since Jul 3.

## Status
Fix NOT RUN. 79 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC (79th check)
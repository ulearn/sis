Issue 48 Addendum 13 Aug 2026 (106th check) -- Telmuun Enkhsaikhan 0 Class Assignments

Reporter: AC  Area: Attendance/classes  Sheet row: 50

Root Cause (106th check -- confirmed Thu 13 Aug UTC)
- Booking Course 1810 (Academic Year Renewal Morning): student 293 (Telmuun Enkhsaikhan)
- classAssignments = 0 -- 45 days since Jun 29 2026
- Booking 1624: PARTIAL, confirmed = false, EUR 250 open balance, EUR 1,406 paid

Fix Recipe -- NOT YET RUN
  Step 1: SELECT id, name FROM class WHERE active = true ORDER BY name;
  Step 2: INSERT INTO student_class_assignment (booking_course_id, student_id, class_id, weekStart, weekEnd)
          VALUES (1810, 293, CLASS_ID, chr(39)||2026-06-29||chr(39), chr(39)||2027-01-01||chr(39));
  Step 3: Investigate EUR 250 open balance -- check HubSpot deal for student 293.

Risk: bookings / attendance. Reversible. Blast radius: 1 student. Urgency: High (45d untracked).

Status: Fix NOT RUN. 106 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC (106th check)
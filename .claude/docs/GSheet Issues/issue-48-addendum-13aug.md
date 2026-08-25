# Issue 48 Addendum 13 Aug 2026 (105th check) -- Telmuun Enkhsaikhan 0 Class Assignments

Reporter: AC  Area: Attendance/classes  Sheet row: 50

## Root Cause (105th check -- confirmed Thu 13 Aug UTC)
- Booking Course 1810 (Academic Year Renewal Morning): student 293 (Telmuun Enkhsaikhan)
- classAssignments = 0 -- 45 days since booking created (since Jun 29 2026)
- Booking 1624: PARTIAL, confirmed = false, EUR 250 open balance
- Payment discrepancy: 1 payment of EUR 100 found vs amountPaid = EUR 1,406 in DB
  (likely migration artefact -- most payments pre-date SIS)

## Fix Recipe -- NOT YET RUN

Step 1: Determine correct AM class for Telmuun (student 293)
  Check current AM class list: SELECT id, name FROM class WHERE type = 'AM' AND active = true;

Step 2 (NOT YET RUN): Insert class assignment for BC 1810
  INSERT INTO student_class_assignment
    (booking_course_id, student_id, class_id, "weekStart", "weekEnd")
  VALUES (1810, 293, CLASS_ID, '2026-06-29', '2027-01-01');

Step 3: Investigate EUR 250 open balance -- check HubSpot deal for Telmuun.

## Risk
Category: bookings / attendance. Reversible. Blast radius: 1 student.
Urgency: Moderate -- student untracked for 45 days.

## Status
Fix NOT RUN. 105 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC (105th check)

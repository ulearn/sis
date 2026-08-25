# Issue 38 Addendum 13 Aug 2026 (143rd check) -- ABSOLUTE LAST CALL

Reporter: PG  Area: Booking / Class  Sheet row: 40

## Symptom
BC 25043 (General English PM, 10-14 Aug 2026) has 0 class assignments.

## Root Cause (143rd check -- confirmed Thu 13 Aug UTC)
- Booking Course 25043: student 14602 (Eduardo Roche Diaz), booking 18265
- classAssignments = [] -- no assignment ever made
- Booking 18265: CONFIRMED, EUR 126 paid, EUR 0 open
- endDate: 2026-08-14 -- TOMORROW (Fri 14 Aug)

## Days Lost / Remaining
- Mon 10, Tue 11, Wed 12, Thu 13 Aug: 4 days already lost
- Fri 14 Aug only: one day recoverable if fixed NOW
- After Fri close: course over, attendance permanently lost

## Fix Recipe -- NOT YET RUN

Option A (SIS admin UI -- fastest):
  Student 14602 > Booking 18265 > Booking Course 25043
  > Assign class 6 (B2+C1 PM), weekStart 2026-08-10, weekEnd 2026-08-14

Option B (direct DB -- NOT YET RUN):
  INSERT INTO student_class_assignment
    (booking_course_id, student_id, class_id, "weekStart", "weekEnd")
  VALUES (25043, 14602, 6, '2026-08-10', '2026-08-14');

After insert: record Fri 14 Aug attendance via SIS UI (Mon-Thu retroactive if needed).

## Risk
Category: bookings / attendance. Reversible. Blast radius: 1 student, 1 week.
URGENCY: CRITICAL -- course ends TOMORROW. This is the final check.

## Status
Fix NOT RUN. 143 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC (143rd check)

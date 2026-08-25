Issue 38 Addendum 13 Aug 2026 (144th check) -- LAST HOUR

Reporter: PG  Area: Booking / Class  Sheet row: 40

Symptom
BC 25043 (General English PM, 10-14 Aug 2026) has 0 class assignments.

Root cause (144th check -- Thu 13 Aug UTC, 2nd hourly run)
- Booking Course 25043: student 14602 (Eduardo Roche Diaz), booking 18265
- classAssignments = [] -- no assignment ever made
- Booking 18265: CONFIRMED, EUR 126 paid, EUR 0 open
- endDate: 2026-08-14 -- TOMORROW (Fri 14 Aug)
- Status unchanged from 143rd check (00:13 UTC today)

Days lost / remaining
- Mon 10, Tue 11, Wed 12, Thu 13 Aug: 4 days permanently lost
- Fri 14 Aug only: one day recoverable if fixed before end of school day
- After close Fri 14: course over, attendance permanently incomplete

Fix recipe -- NOT YET RUN
Option A (SIS admin UI):
  Student 14602 > Booking 18265 > Booking Course 25043
  > Assign class 6 (PM), weekStart 2026-08-10, weekEnd 2026-08-14

Option B (direct DB -- NOT YET RUN):
  INSERT INTO student_class_assignment (booking_course_id, student_id, class_id, "weekStart", "weekEnd")
  VALUES (25043, 14602, 6, chr(39)||2026-08-10||chr(39), chr(39)||2026-08-14||chr(39));

Risk: bookings / attendance. Reversible. Blast: 1 student, 1 week. CRITICAL.

Status: Fix NOT RUN. 144 consecutive checks.
Last checked: Thu 13 Aug 2026 UTC (144th check)
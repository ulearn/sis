# Issue 38 — Eduardo Roche Diaz / BC 25043 (ABSOLUTE FINAL)

Reporter: AC | Sheet row: 40 | Last checked: 2026-08-13 UTC (148th hourly check)

## Root cause
- BC 25043: General English PM, 2026-08-10 to 2026-08-14 (tomorrow), active=true, 0 class assignments
- Mon 10, Tue 11, Wed 12, Thu 13 Aug permanently lost (4 teaching days)
- Booking 18265: CONFIRMED, EUR 126 paid, EUR 0 open

## Fix recipe (NOT YET RUN)
Step 1: Assign BC 25043 to class 6 (B2/C1 PM), week 10-14 Aug:
  Via SIS admin: Classes > B2/C1 PM > Assign students > wk 10-14 Aug > BC 25043
  DB: INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end) VALUES (25043, 6, '2026-08-10', '2026-08-14');
Step 2: Verify Eduardo in B2/C1 PM for Fri 14 Aug.

## Status
Open. Mon-Thu permanently lost. Fri 14 Aug still recoverable.
URGENCY: course ends tomorrow — fix must run before Friday morning.
Last checked: 2026-08-13 UTC (148th hourly check)
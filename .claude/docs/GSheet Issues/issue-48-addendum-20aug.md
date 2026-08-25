Issue 48 -- Telmuun Enkhsaikhan (addendum 20 Aug 2026)
Reporter: KC/AC | Area: Attendance/Classes | Sheet row: 50 | Run: 149th

ROOT CAUSE (149th check, Thu 20 Aug 2026 UTC -- no change from 148th Wed 19 Aug):
- Booking 1624 (Telmuun Enkhsaikhan, student 293): PARTIAL, confirmed = false
- Amount paid = EUR 1,406; amount open = EUR 250; total EUR 1,656
- Only 1 payment in DB: ID 17956, EUR 100, 31 Mar 2026, Xero Payment ID = null
- EUR 1,306 unaccounted -- likely paid outside SIS via HubSpot or TransferMate
- Booking Course 1810 (Academic Year Renewal Morning): 29 Jun 2026 to 1 Jan 2027, active, 0 class assignments -- day 53

FIX RECIPE (NOT YET RUN):
Step 1 -- Investigate EUR 1,306 payment gap
  Check HubSpot deal for student 293 and TransferMate records not in SIS.
  If found: record payments against Booking 1624.
Step 2 -- Assign class to Booking Course 1810
  SQL: SELECT id, name FROM classes WHERE name LIKE '%AM%' OR name LIKE '%Morning%'; -- find morning class id
  SQL: INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, created_at, updated_at) VALUES (1810, CLASS_ID, WEEK_START, WEEK_END, NOW(), NOW()); -- NOT YET RUN
Step 3 -- Set confirmed = true after payment gap resolved
  SQL: UPDATE bookings SET confirmed = true, updated_at = NOW() WHERE id = 1624; -- NOT YET RUN
Step 4 -- Settle EUR 250 outstanding balance with student/agency

RISK: money (verify gap source first) | Reversible | Blast radius: Telmuun Enkhsaikhan (student 293, booking 1624)
Status: Open -- Fix NOT RUN. Last checked: 2026-08-20 UTC (149th run)
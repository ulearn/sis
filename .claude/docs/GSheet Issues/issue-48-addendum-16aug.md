Issue 48 - Telmuun Enkhsaikhan BC1810 no class (134th check)
Reporter: various | Area: Attendance/Classes | Sheet row: 50 | Sun 16 Aug 2026 UTC

Root Cause (134th check - 16 Aug 2026 UTC)
- Booking 1624 (Telmuun Enkhsaikhan, student 293): PARTIAL, confirmed = false, EUR 1,406 paid, EUR 250 open
- Booking Course 1810 (Academic Year Renewal Morning): 29 Jun 2026 to 1 Jan 2027, active = true
- Days since Booking Course 1810 started: 48 -- still 0 Student Class Assignments (unchanged from 133rd check)
- EUR 250 balance outstanding -- blocking class assignment

Fix Recipe (NOT YET RUN)

Step 1 - Chase EUR 250 balance on booking 1624
Step 2 - Once paid: UPDATE bookings SET confirmed = true WHERE id = 1624;
Step 3 - Create Student Class Assignment for Booking Course 1810 (Academic Year Morning class)

Risk: bookings / class assignment; reversible; single student

Status: Open - Fix NOT RUN
Last checked: 2026-08-16 UTC (134th check)

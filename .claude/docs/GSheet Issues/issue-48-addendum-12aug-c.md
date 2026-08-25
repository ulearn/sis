# Issue 48 - Missing Class Assignments + Payment Gap
Reporter: AC | Area: Attendance/Classes | Sheet row: 50 | 100th check Wed 12 Aug 2026 UTC

Symptom: Several students not in SIS for class assignment.
Booking Course 1810 (Telmuun Enkhsaikhan) has 0 class assignments after 45 days.
Booking 1624 has EUR 250 open balance.

Root Cause (100th check - unchanged):

Booking Course 1810:
- Student: Telmuun Enkhsaikhan (student 293)
- Name: Academic Year Renewal Morning
- Period: 29 Jun 2026 to 1 Jan 2027 (active = true)
- Class assignments: 0 - 45 days since course start, still unassigned

Booking 1624:
- Status: PARTIAL, confirmed = false
- Amount paid: EUR 1,406, amount open: EUR 250, total: EUR 1,656

Previously identified stale Booking Courses for other students:
BCs 482, 483, 1609, 1610, 1611, 1612 - check before deactivating.

Fix Recipe (NOT YET RUN):

Step 1 - Assign BC 1810 to AM class (NOT YET RUN):
Via SIS UI: Booking 1624 -> Courses -> BC 1810 -> assign to appropriate AM class.
Or via DB (confirm class_id from SIS UI first):
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, student_id)
  VALUES (1810, <am_class_id>, '<current_week_start>', '<current_week_end>', 293);

Step 2 - Clarify EUR 250 open balance (NOT YET RUN):
Check HubSpot deal for Booking 1624. Either collect payment or adjust booking total.
Once paid: UPDATE bookings SET confirmed = true, amount_open = 0 WHERE id = 1624;

Step 3 - Verify stale BCs 482, 483, 1609-1612:
  SELECT id, name, end_date, active FROM booking_courses WHERE id IN (482, 483, 1609, 1610, 1611, 1612);
Deactivate any with end_date in the past and no pending cert work.

Risk / Category:
- Category: bookings / data-hygiene / money
- Reversible: yes
- Blast radius: 1 student class assignment, 1 booking payment, up to 8 stale BCs

Status: OPEN - unchanged 100 consecutive checks. Fix NOT RUN.
Last checked: Wed 12 Aug 2026 UTC (100th check)
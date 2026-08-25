# Issue 48 - BC 1810 Telmuun Enkhsaikhan - 0 Class Assignments (103rd check 12 Aug 2026)

Reporter: AC  Area: Attendance/Classes  Sheet row: 50

## Symptom
Telmuun Enkhsaikhan not in SIS for class assignment. Booking Course 1810: 0 class assignments for 44 days.

## Root Cause (103rd check — unchanged)
- Booking Course 1810 (Academic Year Renewal Morning, student 293 Telmuun Enkhsaikhan):
  start_date = 2026-06-29, end_date = 2027-01-01, active = true
  classAssignments = [] — 44 days since course start with no assignment
- Booking 1624: status = PARTIAL, confirmed = false
  amount_paid = EUR 1,406, amount_open = EUR 250 (unchanged)
  Partial payment blocking class-to-be-assigned filter

## Fix Recipe — NOT YET RUN

Step 1 — Assign Booking Course 1810 to AM class:
  Via SIS admin: Student 293 > Booking 1624 > Booking Course 1810
  > assign AM class, weekStart = 2026-06-29, weekEnd = 2027-01-01

Step 2 — Resolve EUR 250 open balance on Booking 1624:
  - If paid: locate and link payment to booking_id = 1624
  - If outstanding: leave confirmed = false
  - If write-off: UPDATE bookings SET confirmed = true, amount_open = 0 WHERE id = 1624;

## Risk
Category: bookings/class assignments. Reversible. Blast radius: 1 student.

## Status
Fix NOT RUN. 103 consecutive checks. Booking Course 1810: 0 class assignments for 44 days. EUR 250 open unchanged.
Last checked: Wed 12 Aug 2026 UTC ~20:00 (103rd check)
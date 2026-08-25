# Issue 48 - BC 1810 Telmuun Enkhsaikhan - 0 Class Assignments (104th check 12 Aug 2026)

Reporter: AC  Area: Attendance/Classes  Sheet row: 50

## Symptom
Telmuun Enkhsaikhan: Booking Course 1810 has 0 class assignments for 44 days.

## Root Cause (104th check — unchanged)
- Booking Course 1810 (Academic Year Renewal Morning, student 293 Telmuun Enkhsaikhan):
  start_date = 2026-06-29, end_date = 2027-01-01, active = true, classAssignments = []
- Booking 1624: status = PARTIAL, confirmed = false, EUR 1,406 paid, EUR 250 open
- Only 1 payment record: EUR 100 on Jun 29 2026 vs amountPaid = EUR 1,406
  (likely Fidelo migration artefact: historical total imported; individual payments not migrated)

## Fix Recipe — NOT YET RUN

Step 1: Assign BC 1810 to AM class (SIS admin: Student 293 > Booking 1624 > BC 1810)
Step 2: Investigate EUR 250 open — confirm whether Fidelo artefact or genuinely outstanding
Step 3: If confirmed paid: UPDATE bookings SET amount_open=0, confirmed=true WHERE id=1624;
Step 4: Reconcile with Xero if gap confirmed.

## Risk
Category: bookings/class assignments. Reversible. Blast radius: 1 student.

## Status
Fix NOT RUN. 104 consecutive checks. BC 1810: 0 class assignments for 44 days.
Last checked: Wed 12 Aug 2026 UTC ~21:00 (104th check)
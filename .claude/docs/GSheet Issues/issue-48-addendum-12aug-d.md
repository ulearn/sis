Issue 48 - BC 1810 Telmuun Enkhsaikhan - 0 Class Assignments (102nd check 12 Aug 2026)

Reporter: AC  Area: Attendance/Classes  Sheet row: 50

Symptom: Telmuun Enkhsaikhan not appearing in SIS for class assignment. BC 1810 has 0 SCAs after 46 days.

Root Cause (102nd check confirmed):
- Booking Course 1810 (Academic Year Renewal Morning, student Telmuun 293):
  start_date = 2026-06-29, end_date = 2027-01-01, active = true
  classAssignments = [] (0) - 46 days since course start with no assignment
- Booking 1624 (Telmuun): status=PARTIAL, confirmed=false
  amount_paid = EUR 1,406, amount_open = EUR 250 (unchanged)
  Partial payment causing payment-not-received gate in class-to-be-assigned filter

Fix Recipe - NOT YET RUN:
  Step 1: Assign BC 1810 to AM class:
    Via SIS admin: Student 293 -> Booking 1624 -> BC 1810
    -> assign appropriate AM class, weekStart=2026-06-29, weekEnd=2027-01-01

  Step 2: Resolve EUR 250 open balance on Booking 1624:
    - If paid: locate payment and link to booking_id=1624
    - If genuinely outstanding: leave confirmed=false until paid
    - If write-off: UPDATE bookings SET confirmed=true, amount_open=0 WHERE id=1624;

Risk: bookings / class assignments. Reversible. Blast radius: 1 student.

Status: Fix NOT RUN. 102 consecutive checks. BC 1810: 0 SCAs for 46 days. EUR 250 open unchanged.
Last checked: Wed 12 Aug 2026 UTC (102nd check)
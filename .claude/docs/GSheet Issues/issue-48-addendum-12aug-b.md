Issue 48 - Telmuun Enkhsaikhan + others (BC 1810: 0 class assignments, 48 days)
Reporter: AC | Area: Attendance/classes | Sheet row: 50 | 99th check Wed 12 Aug 2026 UTC

Symptom: Several students (ILEP + renewals) not appearing in SIS class assignment search.

Root Cause (confirmed):
  Booking Course 1810 (Academic Year Renewal Morning, student 293 Telmuun Enkhsaikhan):
    ends 2027-01-01, active = true, 0 class assignments — 48 days without SCA
  Booking 1624: PARTIAL, confirmed = false, EUR 1406 paid, EUR 250 open (EUR 1656 total)
  Stale legacy BCs still active on this booking:
    BC 482 (ended Mar 2025), BC 483 (Jul 2025), BC 1609 (Dec 2025),
    BC 1610 (Jan 2026), BC 1611 (Mar 2026), BC 1612 (May 2026)

Fix Recipe (NOT YET RUN):
  Step 1 - Assign BC 1810 to AM class (confirm which class with Paul):
    INSERT INTO class_assignments (booking_course_id, class_id, week_start, week_end)
    VALUES (1810, <class_id>, 2026-08-12, 2027-01-01);
  Step 2 - Deactivate stale BCs 482, 483, 1609, 1610, 1611, 1612:
    UPDATE booking_courses SET active = false WHERE id IN (482, 483, 1609, 1610, 1611, 1612);
  Step 3 - Clarify EUR 250 open balance (Fidelo gap or genuine arrears):
    Check Fidelo records / HubSpot deal for Booking 1624.

Risk: Attendance/bookings. Reversible. Blast radius: 1 SCA + 6 stale BC deactivations.
Status: OPEN - NOT YET RUN. 99th check. 48 days with 0 SCAs.
Last checked: Wed 12 Aug 2026 UTC
ISSUE 24 - Alberto Squillace: missing class assignment + stale booking course
=============================================================================

Area: Booking/Classes  Row: 25  Checked: 2026-08-01 UTC (11th hrly, 4th of day)

SYMPTOM
-------
BC1797 (ended Jun 26, stale 36d, still active) and BC24686 (started Jul 20, active, fee=null, 0 SCAs).
12 teaching days lost. Aug 1 is Saturday - no new losses today.

ROOT CAUSE / DB STATE (confirmed 2026-08-01 UTC, 4th check of day)
--------------------------------------------------------------------
- Booking 1611 (student 1052 Alberto Squillace): CONFIRMED, confirmed = true, paid = EUR 1,280.12.
- Booking course 1797 (Morning General, Apr 6-Jun 26 2026): active = true, fee = EUR 1,836, stale 36 days.
  Has class assignment SCA 229 (class 12) -- must move or create new SCA on BC24686.
- Booking course 24686 (Morning General, Jul 20-Sep 18 2026): active = true, fee = null, 0 class assignments.
- Days lost: 12 weekdays (Jul 20-Jul 31; Aug 1 is Sat, no school).
- Days remaining after Aug BH: approx 32 weekdays (Aug 4-Sep 18).
- Info needed: Alberto's current class + confirmed fee for BC24686 (ask Paul).

FIX RECIPE (NOT YET RUN)
------------------------

Step 1 - Get class + fee from Paul (ask urgently):
  - Which class is Alberto in from Jul 20?
  - Confirmed fee for BC24686?

Step 2 - Set fee on BC24686 (NOT YET RUN):
  UPDATE booking_course SET fee = <FEE> WHERE id = 24686;

Step 3 - Create or reassign class assignment (NOT YET RUN):
  -- Option A: reassign SCA 229 to BC24686 and update dates/class if needed:
  UPDATE student_class_assignments SET booking_course_id = 24686, class_id = <CLASS_ID>,
    start_date = '2026-07-20', end_date = '2026-09-18' WHERE id = 229;
  -- Option B: create new SCA and leave SCA 229 on BC1797 (historic record):
  INSERT INTO student_class_assignments
    (booking_course_id, class_id, start_date, end_date, created_at, updated_at)
  VALUES (24686, <CLASS_ID>, '2026-07-20', '2026-09-18', NOW(), NOW());

Step 4 - Deactivate BC1797 (NOT YET RUN):
  UPDATE booking_course SET active = false WHERE id = 1797;

Step 5 - Verify:
  SELECT bc.id, bc.name, bc.start_date, bc.end_date, bc.active, bc.fee,
         sca.id as sca_id, sca.class_id
  FROM booking_course bc
  LEFT JOIN student_class_assignments sca ON sca.booking_course_id = bc.id
  WHERE bc.booking_id = 1611 ORDER BY bc.start_date;

RISK
----
Category: class assignments/scheduling. Reversible: yes. Blast radius: 1 student. 32d remaining - urgent.

STATUS: OPEN - SCA NEEDED (12d lost; 32d remain)
Last checked: 2026-08-01 UTC (11th check, 4th of day)

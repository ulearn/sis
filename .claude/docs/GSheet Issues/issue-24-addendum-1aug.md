ISSUE 24 — Alberto Squillace: missing SCAs + stale BC + fee=null
================================================================

Area: Booking/Class  Row: 25  Checked: 2026-08-01 UTC (8th hrly)

SYMPTOM
-------
Student has two BCs (BC1797 Apr-Jun, BC24686 Jul-Sep). BC24686 has 0 SCAs and fee=null. No class assignment for 36+ days.

ROOT CAUSE / DB STATE (confirmed 2026-08-01 UTC)
------------------------------------------------
- Student 1052 (Alberto Squillace): visa_status=null. Booking 1611 confirmed=true, paid=EUR 1280.12.
- BC1797 (Morning General, Apr 6–Jun 26 2026): active=true — STALE 36 days (ended Jun 26). fee=EUR 1836.
- BC24686 (Morning General, Jul 20–Sep 18 2026): active=true — fee=NULL, 0 class assignments.
- SCA229: on BC1797 class 12, week Apr 6–26 only. Last SCA. Expired Jun 26 (36 days ago).
- Teaching days lost: Jul 20–Aug 1 = approx 12 days on BC24686 without SCA.
- Remaining teaching days: Aug 4–Sep 18 ≈ 34 days.
- INFO STILL NEEDED: which class Alberto attends + confirmed fee for BC24686.

FIX RECIPE (NOT YET RUN)
------------------------

Step 0 — Confirm with Paul: Alberto's class ID and fee for BC24686.

Step 1 — Create SCA on BC24686 (NOT YET RUN):
  INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end, created_at)
  VALUES (1052, 24686, <CLASS_ID>, '2026-08-04', '2026-09-18', NOW());
  -- week_start=2026-08-04 (first teaching day after Aug BH)
  -- week_end=2026-09-18 (BC24686 end date)

Step 2 — Set fee on BC24686 (NOT YET RUN):
  UPDATE booking_course SET fee = <FEE_AMOUNT> WHERE id = 24686;

Step 3 — Deactivate stale BC1797 (NOT YET RUN):
  UPDATE booking_course SET active = false WHERE id = 1797;
  -- BC1797 ended 2026-06-26 (36 days ago); no active SCAs needed

Step 4 — Update visa_status if applicable (NOT YET RUN):
  UPDATE student SET visa_status = 'GRANTED' WHERE id = 1052;

Step 5 — Verify:
  SELECT id, name, start_date, end_date, active, fee FROM booking_course WHERE booking_id = 1611;
  SELECT id, class_id, booking_course_id, week_start, week_end FROM student_class_assignments WHERE student_id = 1052;

RISK
----
Category: bookings/class assignments/data-hygiene. Reversible: yes. Blast radius: 1 student.
URGENCY: Student unassigned for 12 teaching days. Attendance cannot be tracked.

STATUS: OPEN — SCA urgent; ~34 teaching days remain (Aug 4 Tue – Sep 18 Fri, Aug BH excluded)
Last checked: 2026-08-01 UTC (2nd check of day)
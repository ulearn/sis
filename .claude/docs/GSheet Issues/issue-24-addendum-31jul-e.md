Issue 24 Addendum  31 Jul 2026 (e)  Alberto Squillace: 11 Days Lost, Still No SCA
Reporter: Staff  Area: Booking / Class  Sheet row: 25  Student: Alberto Squillace (s1052)
Last checked: 2026-07-31 UTC (7th hourly check)

SYMPTOM
Student has active BC 24686 (Jul 20-Sep 18 2026) but zero class assignments. 11 teaching days lost.

CURRENT DB STATE (this run)
- Student 1052 (Alberto Squillace): visa_status = null
- Booking 1611: fully paid EUR 1280.12
- BC 24686 (Morning General, Jul 20-Sep 18 2026): active=true, fee=null, 0 SCAs
- BC 1797 (Morning General, Apr 6-Jun 26 2026): active=true (STALE -- ended 35 days ago), fee=EUR 1836
- SCA 229: on BC 1797, class 12, week_start=Apr 6, week_end=Apr 26 (only SCA; expired Jun 26)
- BC 24686 has 0 SCAs -- student attended 11 school days (Jul 20-31) with no formal class assignment
- Teaching days remaining: Aug 4-Sep 18 = approximately 34 days (after Aug BH on Aug 3)

FIX RECIPE (NOT YET RUN)

Step 1 -- Confirm which class Alberto is currently attending (needed before SCA insert)
  Ask staff / Kelly. Likely class 12 (same as prior SCA on BC 1797).

Step 2 -- Create retroactive SCA on BC 24686 for Jul 20-31
  INSERT INTO student_class_assignments
    (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES (24686, 1052, <class_id>, '2026-07-20', '2026-07-31');
  (If the system expects one row per week, insert two: Jul 20-24 and Jul 27-31.)

Step 3 -- Create ongoing SCA for Aug 4 onward
  INSERT INTO student_class_assignments
    (booking_course_id, student_id, class_id, week_start, week_end)
  VALUES (24686, 1052, <class_id>, '2026-08-04', '2026-09-18');
  (Or one row per week if required.)

Step 4 -- Set fee on BC 24686 (currently null)
  Confirm fee with accounts. Likely EUR 1836 (9 weeks at same rate as BC 1797) or prorated.
  UPDATE booking_courses SET fee = <confirmed_fee> WHERE id = 24686;

Step 5 -- Deactivate stale BC 1797
  UPDATE booking_courses SET active = false WHERE id = 1797;

Step 6 -- Set visa_status on student 1052
  Confirm with staff.
  UPDATE students SET visa_status = 'approved' WHERE id = 1052;

RISK / CATEGORY
- Category: bookings / class assignments
- Reversible: SCA inserts can be deleted; fee and active updates are reversible.
- Blast radius: 1 student. Low risk; mounting urgency as more days pass unrecorded.
- INFO NEEDED: (a) which class is Alberto in, (b) confirmed fee for BC 24686.

STATUS
NOT RUN. 7th hourly check (Fri 31 Jul 2026).
BC 24686: 0 SCAs, fee=null. BC 1797: stale and still active (35d). visa_status: null.
11 teaching days lost Jul 20-31. 34 remain. URGENT.
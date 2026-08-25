# Issue 23 - Enshi Lu (student 397): Course c828 end_date before start_date

- Reporter: B column empty (no student named in sheet)
- Area: Booking / Class / Holiday
- Sheet row: 24

## Symptom
Course dates dont make sense - start march finish feb.

## Root cause
Student identified: Enshi Lu (student 397), bk787 CONFIRMED fully paid 2147.5.

Course c828 Academic Year Morning:
  start_date = 2026-03-02
  end_date   = 2026-02-27  <- 3 days BEFORE start_date (BACKWARDS)

Legacy DST off-by-one bug (Issue #2). Student had holiday hol51 (bh.id=51) Feb23-Mar01.
Pre-fix shunt computed course-end in local time -> end fell before start.
This is one of the 56 legacy oddities flagged but NOT auto-corrected in Issue #2 batch.

Full course sequence bk787:
  c826: 2025-11-17 to 2025-11-28  OK
  c827: 2026-01-05 to 2026-01-30  OK
  c828: 2026-03-02 to 2026-02-27  BACKWARDS
  c829: 2026-03-30 to 2026-06-05  OK

Holidays: hol50 school Dec22-Jan04, hol51 student Feb23-Mar01, hol52 student Mar23-Mar29.
Gap: no course row for Jan31-Feb22 (~3.5 wks) - possibly further corruption.

## Fix recipe (NOT YET RUN)

### Step 1 - Correct c828 end_date
Last Friday before hol52 (Mar23) = 2026-03-20:
  -- NOT YET RUN
  UPDATE booking_courses SET end_date = '2026-03-20' WHERE id = 828;

Verify: SELECT id, start_date, end_date FROM booking_courses WHERE id = 828;
Expected: start=2026-03-02 end=2026-03-20

### Step 2 - Investigate Jan31-Feb22 gap (low priority)
No course covers Jan31-Feb22. If student attended, add:
  -- NOT YET RUN - check attendance first
  INSERT INTO booking_courses (booking_id, name, category, start_date, end_date)
  VALUES (787, 'Academic Year Morning', 'MORNING', '2026-01-31', '2026-02-20');

### Step 3 - Check/fix SCAs for WB Mar02-Mar20
  SELECT sca.id, sca.week_start, sca.week_end, c.name
  FROM student_class_assignments sca
  JOIN classes c ON c.id = sca.class_id
  WHERE sca.student_id = 397;
If none cover Mar02-Mar20, re-assign via SIS class management.

## Risk / category
- Category: bookings / data-hygiene
- Reversible: yes - simple date update
- Blast radius: single course row; no money impact

## Related
Issue #2 (issue-2-holiday-shunt.md) - same root cause, one of 56 legacy oddities.

## Status
Pending Neil action (UPDATE booking_courses SET end_date=2026-03-20 WHERE id=828).
Last checked: 2026-06-08 UTC
Last checked: 2026-06-09 UTC hrly: c828 STILL backwards (start=Mar02, end=Feb27). Hash changed (cell whitespace drift). DB unchanged. UPDATE end_date=Mar20 per recipe.
Last checked: 2026-06-09 UTC hrly: CONFIRMED still backwards. c828 start=2026-03-02 end=2026-02-27. Simple fix: UPDATE booking_courses SET end_date='2026-03-20' WHERE id=828. Day 10+ unresolved.
Last checked: 2026-06-10 UTC hrly2: STILL backwards. c828 start=2026-03-02 end=2026-02-27. Day 11+. Simple 1-row fix awaiting Neil.

Last checked: 2026-06-10 UTC hrly5: NOTE — SHEET ROW WAS WRONG (previous runs wrote Alberto bk1611 data into Enshi row 24 — now corrected on sheet). This recipe (bk787, c828 backwards) is correct for Enshi Lu. Student finished Jun05. Data-only fix, no urgency. Correct end_date = 2026-03-20 (last Friday before hol52 Mar23).
Last checked 2026-06-17 UTC hrly: bc828 STILL BACKWARDS (startDate=2026-03-02, endDate=2026-02-27, updAt=May11 UNCHANGED). bc829 ended Jun05 (12d ago). sca58 expired May31. No active courses or SCAs for s397 Enshi Lu. Term complete. Low-priority data hygiene. Correct fix: UPDATE booking_courses SET end_date=2026-03-20 WHERE id=828. NOT RUN.

Last checked 2026-06-18 UTC hrly: UNCHANGED. bc828 STILL BACKWARDS start=Mar02 end=Feb27 (updAt=May11=38d stale). Low-priority cosmetic bug — no active students affected. Fix NOT RUN.
Last checked 2026-06-23 UTC hrly: UNCHANGED. bc828 STILL BACKWARDS (start=Mar02 end=Feb27, updAt=May11=43d). bc829 ended Jun05=18d. bk787 CONF 2147.5 fully paid. Low-priority data hygiene. Fix NOT RUN.

Last checked: 2026-06-25 UTC hrly — bc828 startDate=Mar02 endDate=Feb27 STILL BACKWARDS (updAt=May11=44d). bc826+bc827+bc828+bc829 all active=true fee=null. bc829 ended Jun05=20d ago. Historical data bug. Fix NOT RUN: UPDATE booking_courses SET end_date='2026-03-20' WHERE id=828.
Last checked: 2026-07-01 UTC hrly (5th check, fresh DB) — bc828 STILL BACKWARDS (startDate=2026-03-02 endDate=2026-02-27, updAt=May11=51d stale). bk787 CONF 2147.5/2147.5 confirmed=true. All 4 BCs active=true (stale). bc829 ended Jun05=26d ago. Low-priority data hygiene. Fix NOT RUN: UPDATE booking_courses SET end_date=2026-03-20 WHERE id=828.

Last checked: 2026-07-02 UTC (6th check, fresh DB) — bc828 STILL BACKWARDS (startDate=2026-03-02 endDate=2026-02-27, updAt=May11=52d stale). bk787 CONF 2147.5/2147.5. All BCs active=true (stale). bc829 ended Jun05=27d ago. Low-priority data hygiene. Fix NOT RUN: UPDATE booking_courses SET end_date='2026-03-20', active=false WHERE id=828.

**14 Jul TUE UTC (fresh DB, 11th check). UNCHANGED. BC828 Academic Year Morning bk787: startDate=2026-03-02, endDate=2026-02-27 (backwards — start AFTER end). active=STILL true, updatedAt=May11=64d stale. Low priority cosmetic. Fix NOT RUN.**

**17 Jul FRI UTC UTC (12th check, fresh DB). CONFIRMED UNCHANGED. BC828 AY Morning bk787: startDate=2026-03-02, endDate=2026-02-27 (backwards — start AFTER end, 3d discrepancy). active=STILL true, updatedAt=May11=67d stale. Cosmetic data-hygiene fix only. Fix NOT RUN: UPDATE booking_courses SET end_date='2026-03-20', active=false WHERE id=828;

**19 Jul SUN UTC (14th check, fresh DB). NEW FINDING: All 4 booking courses for student 397 are stale active=true. BC826 (Nov17-Nov28 2025) = 233d stale. BC827 (Jan05-Jan30 2026) = 170d stale. BC828 (backwards Mar02/Feb27) still active. BC829 (Mar30-Jun05 2026) = 44d stale. Fix NOT RUN: deactivate all 4 BCs + correct BC828 end date to 2026-03-20.**

**26 Jul SUN UTC (17th check, fresh DB). UNCHANGED. BC828 Academic Year Morning bk787: startDate=2026-03-02, endDate=2026-02-27 (backwards). BC826 ended Nov28 2025 = 240d stale. BC827 ended Jan30 2026 = 177d stale. BC829 ended Jun05 2026 = 51d stale. All active=true. Student Enshi Lu (student 397) finished Mar 2026. Low-priority data hygiene only. Fix NOT RUN: UPDATE booking_courses SET end_date='2026-03-20', active=false WHERE id=828; UPDATE booking_courses SET active=false WHERE id IN (826,827,829);**

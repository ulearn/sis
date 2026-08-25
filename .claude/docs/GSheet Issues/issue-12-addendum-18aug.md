# Issue 12 — Rakan Alghamdi (Student 14444) + others

**Reporter:** KC | **Area:** Booking / Accomm | **Sheet row:** 13
**Last checked:** 2026-08-18 UTC (185th check)

## Root cause (evidence from live DB)

- Student 14444 (Rakan Alghamdi) / Booking 17915
- SCA 288: class 12, weekStart 6 Jul, weekEnd 18 Dec 2026, bookingCourseId = 24697 (WRONG)
- BC 24697 (Academic Year Morning): 6 Jul to 31 Jul 2026, 18 days stale, active = true, 1 SCA
- BC 25035 (General English Academic Year AM Plus): 3 Aug to 18 Dec 2026, active = true, 0 SCAs
- SCA 288 weekEnd (18 Dec) matches BC 25035 end date — SCA 288 belongs on BC 25035

## Fix recipe (NOT YET RUN)

### Step 1 — Backup
SELECT id, booking_course_id, class_id, week_start, week_end FROM student_class_assignments WHERE id = 288;
SELECT id, name, start_date, end_date, active FROM booking_courses WHERE id IN (24697, 25035);

### Step 2 — Move SCA 288 to BC 25035
UPDATE student_class_assignments SET booking_course_id = 25035 WHERE id = 288;

### Step 3 — Deactivate BC 24697
UPDATE booking_courses SET active = false WHERE id = 24697;

### Step 4 — Verify
SELECT id, booking_course_id, class_id FROM student_class_assignments WHERE id = 288;
SELECT id, name, active FROM booking_courses WHERE id IN (24697, 25035);

## Risk / category
- bookings | class assignment data integrity | reversible | blast radius: 1 SCA, 1 student
- Urgency: medium — student may not appear correctly in class lists

## Status
Open — SCA 288 on wrong BC, BC 24697 stale 18d. Fix not run.
**Last checked:** 2026-08-18 UTC
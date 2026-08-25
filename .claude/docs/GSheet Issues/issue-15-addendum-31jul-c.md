# Issue 15 — Saikhantes Shagdarsuren (3rd check Fri 31 Jul 2026)

Reporter: various | Area: Booking/Class | Sheet row: 16

## Status: Unchanged from 2nd check; hash change is whitespace artefact

## Evidence (live DB)

- Student 1001 (Saikhantes Shagdarsuren): visa_status = null
- Holiday 2500: Jul 20 to Aug 21 2026 (5 weeks)
- Last class assignment 255: class 11 (B1 PM), week_start Jan 12, week_end Jul 3 2026
- Gap: Jul 6-17 (2 weeks) with no class assignment before holiday
- Booking course 24925 (Academic Year Afternoon, Mar 9 to Oct 2 2026): active
- Booking course 1982 (Academic Year Morning, ended Dec 19 2025): active = true — 223 days stale
- Returns Mon Aug 24 2026 — 24 days away; no class assignment for return week

## Fix recipe (NOT YET RUN)

Step 1: Check Jul 6-17 gap with Paul — backfill needed?
  SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE student_id = 1001 ORDER BY week_start DESC;

Step 2: Create class assignment for return (class 11, B1 PM, booking course 24925):
  INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end)
  VALUES (1001, 24925, 11, '2026-08-24', '2026-10-02');

Step 3 (data hygiene): Deactivate stale booking course 1982:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 1982;

## Risk: Class management — reversible. 1 class assignment, 1 stale booking course.
## Last checked: Fri 31 Jul 2026 UTC (3rd check today)

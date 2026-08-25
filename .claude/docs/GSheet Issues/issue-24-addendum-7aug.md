Issue 24 — Alberto Squillace (BC 24686 unassigned 18 days, BC 1797 stale)
Reporter: N/A | Area: Booking | Sheet row: 25
Status Update: Fri 7 Aug 2026 UTC (62nd check)

SYMPTOM
Short-term student with Fidelo migration holidays. Two booking courses exist; second one unassigned to any class.

ROOT CAUSE (verified this check)
- Student 1052 (Alberto Squillace): visa_status=null
- Booking 1611: CONFIRMED, confirmed=true, fully paid EUR 1,280.12, serviceEnd=18 Sep 2026

Booking Course 24686 (Morning General, 20 Jul to 18 Sep 2026): active=true, 0 class assignments
- 18 days since course start with no class assignment (was 17 days last check)
- Attendance cannot be tracked; student may be attending without record

Booking Course 1797 (Morning General, ended 26 Jun 2026): active=true — 42 days stale

FIX RECIPE (NOT YET RUN)

Step 1 URGENT — Find Alberto previous class level:
  SELECT sca.class_id, c.name FROM student_class_assignments sca
  JOIN classes c ON c.id=sca.class_id
  WHERE sca.booking_course_id=1797 ORDER BY sca.week_end DESC LIMIT 1;

Step 2 — Assign BC 24686 to class (replace class_id from Step 1):
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end, created_at, updated_at)
  VALUES (24686, 1052, <class_id>, '2026-07-20', '2026-09-18', NOW(), NOW());

Step 3 — Deactivate stale Booking Course 1797:
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=1797;

Step 4 — Verify:
  SELECT id, booking_course_id, class_id, week_end FROM student_class_assignments WHERE booking_course_id=24686;
  SELECT id, active, end_date FROM booking_courses WHERE id IN (1797, 24686);

RISK
Category: bookings, attendance (student unassigned 18 days). Reversible: yes. Blast radius: 1 student.

STATUS
Fix NOT RUN. Last checked: Fri 7 Aug 2026 UTC (62nd hourly check).
BC 24686: 0 SCAs, 18 days since Jul 20 start. BC 1797: 42 days stale.

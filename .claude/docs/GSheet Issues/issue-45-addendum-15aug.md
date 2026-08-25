Issue 45 — Renewal Students / Stale Booking Courses — Addendum 15 Aug 2026

Reporter: Staff | Area: Renewal students | Sheet row: 47
Last checked: 2026-08-15 UTC (98th check)

SYMPTOM
Returning students not appearing on arrivals list. Root cause: mass of old booking courses left active=true after their end dates.

ROOT CAUSE (98th check, Sat 15 Aug 2026 UTC)
- Stale active Booking Courses (end_date < 2026-08-15): 24,497 — UNCHANGED from 94th check
- Booking Courses with end_date = 2026-08-15 entering stale today: 0
- Live active Booking Courses (end_date >= 2026-08-15): 268 — unchanged

STALE COUNT TREND
  2026-08-14:         stale=24,479  live=286
  2026-08-15 00:09:   stale=24,497  live=268  (+18 from Aug 14 end-dates)
  2026-08-15 ~01:00:  stale=24,497  live=268  (stable; 0 courses end-dated today)
  2026-08-15 ~09:00:  stale=24,497  live=268  (285th run; unchanged)

FIX RECIPE (NOT YET RUN)

Stage 1: Safe — no class assignments, ended >180 days ago
  BEGIN;
  UPDATE booking_courses SET active=false
  WHERE active=true
    AND end_date < CURRENT_DATE - INTERVAL '180 days'
    AND (SELECT COUNT(*) FROM student_class_assignments sca WHERE sca.booking_course_id = booking_courses.id) = 0;
  COMMIT;

Stage 2: Moderate — no class assignments, ended 30-180 days ago
  BEGIN;
  UPDATE booking_courses SET active=false
  WHERE active=true
    AND end_date < CURRENT_DATE - INTERVAL '30 days'
    AND end_date >= CURRENT_DATE - INTERVAL '180 days'
    AND (SELECT COUNT(*) FROM student_class_assignments sca WHERE sca.booking_course_id = booking_courses.id) = 0;
  COMMIT;

Stage 3: Manual review — ended <30 days ago OR has class assignments:
  SELECT bc.id, bc.name, bc.end_date, COUNT(sca.id) as sca_count
  FROM booking_courses bc
  LEFT JOIN student_class_assignments sca ON sca.booking_course_id = bc.id
  WHERE bc.active=true AND bc.end_date < CURRENT_DATE
  GROUP BY bc.id, bc.name, bc.end_date
  HAVING COUNT(sca.id) > 0 OR bc.end_date >= CURRENT_DATE - INTERVAL '30 days'
  ORDER BY bc.end_date DESC;

RISK: reversible (SET active=true to restore); affects arrivals list + attendance queries; no financial impact
STATUS: OPEN — Fix NOT RUN. Stale count stable at 24,497. Last checked: 2026-08-15 UTC (98th check)
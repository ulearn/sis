# Issue 45 — Eduardo Roche Diaz (BC25011)

Reporter: AC | Area: Renewal students | Sheet row: 47

## Symptom
BC25011 (Eduardo Roche Diaz, General English PM, booking 18233) had zero class assignments for its entire duration.

## Root cause (Fri 24 Jul 2026 UTC — 75th per-issue check)
- BC25011: General English PM, 20 Jul to 24 Jul 2026 — course now ended
- Student class assignments: 0 (confirmed via DB — classAssignments WHERE booking_course_id=25011)
- Booking 18233: CONFIRMED, confirmed = true
- All 5 school days missed: Mon 20 – Fri 24 Jul 2026
- Course end date (24 Jul) has now passed — window permanently closed

## Fix recipe

WINDOW PERMANENTLY CLOSED — no fix is runnable.

BC25011 ended Fri 24 Jul 2026 with zero class assignments. The course end date has passed; no retroactive class assignment is possible in SIS.

Attendance records for 20–24 Jul 2026 do not exist for Eduardo Roche Diaz on this course.

If attendance tracking is required for this period, a manual note could be added to the student record outside SIS.

Risk: N/A — opportunity expired.

## Status
EXPIRED — window permanently closed Fri 24 Jul 2026. All 5 school days missed (Mon 20 – Fri 24 Jul). Fix opportunity gone.
Last checked: Fri 24 Jul 2026 UTC (75th per-issue check)
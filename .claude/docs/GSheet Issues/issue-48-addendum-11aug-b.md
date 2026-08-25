ISSUE 48 — BC 1810 + Stale Legacy BCs (93rd Check)

Reporter: AC | Sheet row: 50 | Check: 93rd Tue 11 Aug 2026 UTC

Current state:
• BC 1810 (Academic Year Renewal Morning, Telmuun Enkhsaikhan, student 293): ends 2027-01-01, active=true, classAssignments=0 — 45 days with no assignment
• Booking 1624 (Telmuun): PARTIAL, confirmed=false, EUR 1406 paid, EUR 250 open
• Stale legacy BCs (all active=true):
  BC 482 (AY Afternoon): ended 2025-03-14
  BC 483 (AY Afternoon): ended 2025-07-11
  BC 1609 (AY Renewal Afternoon): ended 2025-12-19
  BC 1610 (AY Renewal Afternoon): ended 2026-01-09
  BC 1611 (AY Renewal Afternoon): ended 2026-03-06
  BC 1612 (AY Renewal Afternoon): ended 2026-05-01
• EUR 1306 Fidelo gap — historic credit, needs manual reconciliation.

Fix (NOT YET RUN):
1. Assign BC 1810 to AM class — check Telmuun level, then:
   INSERT INTO student_class_assignments (booking_course_id, class_id, created_at, updated_at) VALUES (1810, AM_CLASS_ID, NOW(), NOW());
2. Deactivate stale BCs:
   UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id IN (482,483,1609,1610,1611,1612);
3. EUR 250 open on booking 1624 — confirm whether expected or Fidelo anomaly.
4. EUR 1306 Fidelo gap — requires Neil review of historical Fidelo records.

Risk: bookings + data-hygiene. Reversible: yes. Blast: low.
Status: BC 1810 45d unassigned. Stale BCs unchanged. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (93rd check)
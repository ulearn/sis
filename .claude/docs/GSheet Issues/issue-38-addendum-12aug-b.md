Issue 38 - Eduardo Roche Diaz (127th check, 12 Aug 2026)

Reporter: AC | Sheet row: 40

Symptom: BC 25043 (General English PM) ends Fri 14 Aug (2 days). 0 class assignments.

Root cause:
- BC 25043 student 14602, ends 2026-08-14, active, classAssignments=0
- Prior weeks class 6 (B2+C1 PM): SCA 358 (20-24 Jul), 359 (27-31 Jul), 421 (3-7 Aug)
- Week 10-14 Aug: no SCA - entire week unrecorded

Fix recipe (NOT YET RUN):
INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end) VALUES (25043, 6, '2026-08-10', '2026-08-14');
Or via SIS admin: BC 25043 > Class 6 (B2+C1 PM) > Week 10-14 Aug.

Risk: bookings/attendance | Reversible: yes | Blast radius: 1 student

Status: CRITICAL - 0 CAs, ends Fri 14 Aug. Last checked: 2026-08-12 UTC (127th check)
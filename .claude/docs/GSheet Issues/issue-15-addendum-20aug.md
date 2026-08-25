# Issue 15 Addendum 20 Aug 2026 Night — Saikhantes Shagdasuren

Reporter: PG | Area: Booking / Class | Sheet rows: 16, 30 (Issue 29 & 15)

Symptom: Course dates / holidays inconsistent; two active courses; attendance broken since Jul 3.

Root cause (187th check, 20 Aug 2026 night — no change since 186th):
- SCA 255: BC 24925, class 11, week_start Jan 12 2026, week_end Jul 3 2026. Only SCA. Coverage ended 48 days ago.
- BC 24925 (Academic Year Afternoon, bk 18151): active, ends Oct 2 2026. 0 current SCAs.
- BC 1982 (Academic Year Morning, bk 1724): active, ended Dec 2025 — 244 days stale.
- Saikhantes returns Tue 25 Aug 2026 = 5 days. No class assignment for Aug-Oct period.

Fix recipe (NOT YET RUN):

Step 1 - Create new SCA on BC 24925 (confirm class ID with Paul/AC):
  INSERT INTO student_class_assignments
    (student_id, booking_course_id, class_id, week_start, week_end)
  VALUES (1001, 24925, <CLASS_ID>, '2026-08-25', '2026-10-02');

Step 2 - Deactivate stale BC 1982:
  UPDATE booking_courses SET active = false WHERE id = 1982;

Risk: bookings/class | Reversible: yes | Blast radius: 1 student
Status: No change. Returns Tue 25 Aug. Action needed before Monday. Last checked: 2026-08-20 night
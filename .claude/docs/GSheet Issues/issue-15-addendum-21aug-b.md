# Issue 15 addendum 21 Aug check 193
Reporter: PG | Sheet row 16 | Student: Saikhantes Shagdarsuren (1001)

Current state verified Fri 21 Aug 2026 late evening UTC:
- BC 24925: Academic Year Afternoon, active, ends 2026-10-02 (42 days left)
- BC 1982: Academic Year Morning, ended 2025-12-19, active=true (245 days stale)
- SCA 255: class 11, weekEnd = 2026-07-03 (only SCA)
- SCAs since Jul 1: NONE (verified by DB query)
- Gap: 49 days with no class assignment
- Student returns Tue 25 Aug. Mon 24 Aug = DEADLINE to create SCA.
- No change since check 192. Fix NOT RUN.

Fix recipe (NOT YET RUN):
  Step 1: Create SCA for week 24 Aug:
    INSERT INTO student_class_assignment
    (student_id, booking_course_id, class_id, week_start, week_end)
    VALUES (1001, 24925, 11, 2026-08-24, 2026-08-28);
  Step 2: Deactivate stale BC:
    UPDATE booking_course SET active = false WHERE id = 1982;
  Step 3: Continue weekly SCA assignments through 2 Oct 2026.

Risk: Bookings/Data-hygiene. Reversible. Blast radius: student 1001 only.
Status: OPEN, Fix NOT RUN. DEADLINE Mon 24 Aug. Last checked: 2026-08-21 22:00 UTC (check 193)
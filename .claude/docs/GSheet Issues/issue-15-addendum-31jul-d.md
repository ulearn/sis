Issue 15 - Saikhantes Shagdarsuren: SCA + Stale BC (4th check 31 Jul 2026)
Student 1001 (Saikhantes Shagdarsuren): visa_status=null, last touched 2026-07-28.
Active BCs: BC24925 (AY Afternoon Mar 9-Oct 2 2026) active-OK; BC1982 (AY Morning Jun30-Dec19 2025) active -- 224d stale.
SCAs: SCA255 (class11, weekEnd Jul3 2026) -- expired 28d ago. No SCA after Jul 3.
Holiday 2500: Jul 20-Aug 21 2026, 5 weeks. Returns Mon 24 Aug 2026 (24d away).
Gap Jul 6-17: 2wks no SCA before holiday -- check with Paul if student attended.

Fix recipe - NOT YET RUN:
1. Deactivate stale BC: UPDATE booking_courses SET active = false WHERE id = 1982;
2. Create SCA for return: class11, weekStart 2026-08-24, weekEnd 2026-10-02, bookingCourseId 24925, studentId 1001
   INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end, created_at) VALUES (24925, 1001, 11, '2026-08-24', '2026-10-02', NOW());
3. Check with Paul re Jul 6-17 gap (SCA ended Jul 3; holiday started Jul 20 -- 2 wks unaccounted).
4. Optional visa: UPDATE students SET visa_status = 'Approved' WHERE id = 1001;
Time-sensitive: SCA needed before Aug 24. Risk: class assignments. Reversible.
Last checked: 2026-07-31 UTC (4th check). Returns in 24 days.
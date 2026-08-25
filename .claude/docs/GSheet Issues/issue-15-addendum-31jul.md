Issue 15 Addendum 31jul (Saikhantes, 134th check, Fri 31 Jul 2026 UTC)

Reporter: PG | Area: Booking/Class | Sheet row: 16

Root Cause (fresh DB check)
- Student 1001 (Saikhantes Shagdarsuren): on holiday (booking_holiday 2500), Jul 20 to Aug 21. Returns Mon 24 Aug.
- Student class assignment 255 (class 11, B1 PM): week_start 2026-01-12, week_end 2026-07-03 — expired 28 days ago; no replacement created.
- Booking course 24925 (Academic Year Afternoon, Mar 9 to Oct 2 2026): active = true.
- Action window: week of Aug 17-24 (still 3 weeks away).

Fix Recipe (NOT YET RUN)

Step 1 — Confirm class 11 (B1 PM) is still the right placement when Saikhantes returns.

Step 2 — Insert new student class assignment for Aug 24 onwards:
  INSERT INTO student_class_assignments
    (booking_course_id, student_id, class_id, week_start, week_end, created_at)
  VALUES
    (24925, 1001, 11, '2026-08-24', '2026-10-02', NOW());
  Verify: SELECT id, student_id, class_id, week_start, week_end FROM student_class_assignments
          WHERE student_id = 1001 ORDER BY week_start DESC LIMIT 3;

Step 3 (optional) — Check if old booking course (pre-24925) is still active and deactivate if so.

Risk: Bookings/Class — reversible insert. Blast radius: 1 SCA record.
Status: NOT RUN. No urgency — Saikhantes on holiday until Aug 21. Act week of Aug 17-24.
Last checked: 2026-07-31 UTC.

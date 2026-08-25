# Issue 15 Addendum 22 Aug 2026 (e)

Sheet row: 16 | Student: 1001 (Saikhantes Shagdarsuren) | Run: 464th

## Root cause (464th check, Sat 22 Aug 2026 UTC)

Fresh DB read:
- Holiday 2500 (Jul 20 to Aug 21 2026): ENDED - student back since 21 Aug.
- Last SCA: SCA 255, class 11, weekEnd 3 Jul 2026 - gap 50 days, no new SCA.
- BC 24925 (Academic Year Afternoon, booking 1724): active=true, ends 2 Oct 2026.
- BC 1982 (Academic Year Morning, booking 1724): active=true, endDate 19 Dec 2025 - STALE 246 DAYS (newly noted this run - not in prior H columns).

BC 1982 ended Dec 2025 but was never deactivated. May cause noise in class-assignment UI.
Mon 24 Aug = 2 days. Student must be assigned to Afternoon class before Monday.

## Fix recipe (NOT YET RUN)

Step 1 - Deactivate stale BC 1982:
  SELECT id, name, endDate, active FROM booking_course WHERE id = 1982;
  UPDATE booking_course SET active = false WHERE id = 1982;
  (Reversible)

Step 2 - Assign student 1001 to Afternoon class:
  SIS admin > Student 1001 > Booking Course 24925 (Academic Year Afternoon).
  Add SCA: class 11, weekStart 2026-08-25, weekEnd 2026-10-02.

Step 3 - Verify:
  SELECT id, class_id, week_start, week_end FROM student_class_assignment
  WHERE booking_course_id = 24925 ORDER BY id DESC LIMIT 5;

## Risk
Bookings + data-hygiene. Reversible. Single student.
Time-sensitive: Mon 24 Aug 2026 (2 days).

## Status
Fix NOT RUN. Last checked: Sat 22 Aug 2026 UTC (464th run)
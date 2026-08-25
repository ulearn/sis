## Issue 15 -- Saikhantes Shagdarsuren -- New SCA Needed After Holiday (131st check 2026-07-30)
Reporter: PG | Area: booking/class | Sheet row: 16
Last checked: 2026-07-30 UTC (131st check)

### Root cause (live DB, 2026-07-30)
- Student 1001 Saikhantes Shagdarsuren: visa_status=null, last updated 2026-07-28
- BC 24925 Academic Year Afternoon: start 2026-03-09, end 2026-10-02, active=true
- SCA 255: week_start 2026-01-12, week_end 2026-07-03, class 11 -- expired 27 days ago
- Holiday 2500: start 2026-07-20, end 2026-08-21, type=student
- Student returns Mon 24 Aug 2026 (first Monday after Aug 21)
- New SCA needed: week_start 2026-08-24, week_end 2026-10-02, class 11, BC 24925

### Fix recipe (NOT YET RUN)
INSERT INTO student_class_assignments
  (booking_course_id, class_id, week_start, week_end, student_id, created_at)
VALUES (24925, 11, '2026-08-24', '2026-10-02', 1001, NOW());
-- Expect 1 row inserted

Verify: SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE booking_course_id=24925 ORDER BY week_start DESC LIMIT 3;
Note: Also confirm visa_status for student 1001 via HubSpot.

### Risk
Category: bookings. Reversible (DELETE inserted row). Blast radius: 1 SCA record.

### Status
NOT YET RUN. Last checked: 2026-07-30 UTC (131st check). Student on holiday to Aug 21; returns Aug 24.
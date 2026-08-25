Issue 29 and 15 - Saikhantes Shagdarsuren: course dates

Reporter: AC | Area: Booking / Class | Sheet row: 30 | Last checked: Thu 30 Jul 2026 UTC

SYMPTOM
Course dates wrong - unexpected Jan 12 restart date; duplicate of Issue 15 (row 16) for same student.

ROOT CAUSE
- Student 1001 (Saikhantes Shagdarsuren).
- SCA 255: class_id=11, week_start=2026-01-12, week_end=2026-07-03 - expired 27 days ago. No new SCA created post-holiday.
- Holiday 2500: start=2026-07-20, end=2026-08-21 (5 weeks). Student returns Mon 24 Aug 2026.
- BC 24925: Academic Year Afternoon, 9 Mar to 2 Oct 2026, active=true, updated 2 Jul 2026. Live course.
- BC 1982 (NEW FINDING 30 Jul): Academic Year Morning, 30 Jun 2025 to 19 Dec 2025, active=true - 223 days stale. Should have been deactivated at AY 2024/25 end.

FIX RECIPE - NOT YET RUN

Step 1: Deactivate stale BC 1982 (NOT YET RUN):
  In SIS admin DB or via node:
  UPDATE booking_courses SET active = false WHERE id = 1982;

Step 2: Create new SCA for post-holiday return (NOT YET RUN):
  Student returns Mon 24 Aug 2026. BC 24925 ends Fri 2 Oct 2026.
  INSERT INTO student_class_assignments
    (student_id, class_id, booking_course_id, week_start, week_end, created_at)
  VALUES (1001, 11, 24925, '2026-08-24', '2026-10-02', NOW());
  Verify class 11 capacity before inserting.

Step 3: See Issue 15 (row 16) for holiday/SCA overlap.

RISK
- Category: Bookings / data-hygiene
- Reversible: Yes - delete inserted SCA, revert active if needed
- Blast radius: Single student; no financial impact

STATUS: Open - fix NOT RUN. Student on holiday until 21 Aug; SCA needed before 24 Aug.
Last checked: Thu 30 Jul 2026 UTC
# Issue 15: Saikhantes Shagdarsuren (Student 1001) — Class Assignment
Reporter: AC | Area: Booking / Class | Sheet row 16 | 466th run 2026-08-22 UTC

## Root cause
- Holiday 2500 (booking 18151): 20 Jul to 21 Aug 2026 -- ended yesterday. Student back since 21 Aug.
- Last SCA: SCA 255, class 11 (B1 PM), week_start 12 Jan 2026, week_end 3 Jul 2026 -- 50-day gap, no new SCA
- Booking Course 24925 (Academic Year Afternoon): active=true, ends 2 Oct 2026 -- correct BC to assign to
- Booking Course 1982 (Academic Year Morning): ended 19 Dec 2025 -- 246 days stale, still active=true
- Monday 24 Aug 2026 = 2 days -- assignment urgently needed

## Fix recipe (NOT YET RUN)
Step 1 -- Assign Saikhantes to Afternoon class for week of 24 Aug (via SIS admin):
  SIS admin > Booking Course 24925 > Class Assignments > Add, week starting 24 Aug 2026
  Assign to appropriate Afternoon class for her level (she was in B1 PM)
  Week start: 2026-08-24, week end: up to BC end 2026-10-02
  Verify no SCA already exists:
  SELECT * FROM student_class_assignments WHERE booking_course_id=24925 AND week_start>='2026-08-24';

Step 2 -- Deactivate BC 1982 (Academic Year Morning, ended Dec 2025):
  SELECT id,name,start_date,end_date,active FROM booking_courses WHERE id=1982;
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=1982;

## Risk
bookings -- reversible. Blast radius: Saikhantes only.
Step 1 is time-critical (Mon 24 Aug). Step 2 is low-risk cleanup.

## Status
URGENT: Mon 24 Aug = 2 days. 50-day class gap. No SCA created.

## Last checked
466th run -- 2026-08-22 UTC
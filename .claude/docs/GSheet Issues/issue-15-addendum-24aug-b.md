# Issue 15 — Saikhantes: Missing Class Assignment (Addendum 24 Aug 2026-b)

**Reporter:** pg | **Area:** booking/class | **Sheet row:** 16 | **Run:** 496th (Mon 24 Aug 2026 UTC)

## Symptom
Student in school today with no valid class assignment. SCA 255 expired 52 days ago (3 Jul).

## Root Cause — Current State

Student: Saikhantes Shagdasuren (ID: 1001)

| Record | Detail |
|--------|--------|
| SCA 255 | Class 11 (B1 PM), weekEnd 2026-07-03 — expired 52 days ago |
| BC24925 | Academic Year Afternoon, 9 Mar to 2 Oct 2026, active — 39 days remaining |
| BC1982 | Academic Year Morning, ended 19 Dec 2025, still active — 248 days stale |

Only one SCA on record (ID 255). No new SCA created after Jul 3. Student has been in class with no valid assignment for 52 days.

## Fix Recipe (NOT YET RUN)

Step 1 — Insert new SCA for BC24925:
  INSERT INTO StudentClassAssignment (studentId,classId,weekStart,weekEnd,bookingCourseId)
  VALUES (1001, 11, '2026-07-07', '2026-10-02', 24925);
  (Confirm class 11 is still active and correct before running.)

Step 2 — Deactivate stale BC1982:
  UPDATE BookingCourse SET active = false WHERE id = 1982;

## Risk / Category
bookings / attendance | reversible | blast radius: single student | URGENT: student in school now

## Status
Open — fix NOT RUN. CRITICAL. Last checked: 24 Aug 2026 UTC (496th run).
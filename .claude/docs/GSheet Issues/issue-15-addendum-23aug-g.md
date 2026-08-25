# Issue 15 Addendum — Saikhantes Shagdarsuren (student 1001)
Reporter: AC/NM | Area: Booking / Class | Sheet rows 16 + 30

## Status — 479th run, Sun 23 Aug 2026 UTC

No change from 477th check. SCA still NOT created. Final automated check before Monday class.

## Root cause

- SCA 255: class 11, BC 24925, week_end 2026-07-03 — expired 51 days ago, no new SCA created
- Holiday 2500 (booking 18151): ended 21 Aug 2026 — student due back Mon 24 Aug
- BC 24925 (Academic Year Afternoon): active, ends 2026-10-02
- Zero class assignments for week of Mon 24 Aug — student arrives tomorrow with no class placement

## Fix recipe — NOT YET RUN

Run in SIS admin or via Prisma:
  node --env-file=.env -e
  ..studentClassAssignment.create({data:{studentId:1001,classId:11,bookingCourseId:24925,weekStart:new Date(2026-08-24),weekEnd:new Date(2026-10-02)}})

Raw SQL:
  INSERT INTO StudentClassAssignment (studentId,classId,bookingCourseId,weekStart,weekEnd,createdAt)
  VALUES (1001, 11, 24925, 2026-08-24, 2026-10-02, NOW());

Verify:
  SELECT id, classId, weekStart, weekEnd FROM StudentClassAssignment WHERE studentId = 1001 ORDER BY weekStart;

## Risk
Category: bookings/class-scheduling | Reversible: yes | Blast radius: 1 student 1 insert

## Status
MUST BE RUN BEFORE 9AM MONDAY 24 AUG 2026. Fix NOT RUN.
Last checked: 2026-08-23 UTC (479th run)
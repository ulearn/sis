# Issue 15 — Saikhantes Shagdarsuren (student 1001) | 181st check Thu 20 Aug 2026 UTC

Sheet row 16 (also row 30/Issue 29) | Reporter: PG | Area: Booking/Class

## DB-verified state (181st — no change from 180th)

Booking 18151: CONFIRMED, confirmed = true, fully paid EUR 1,339.20
Booking Course 24925 (AY Afternoon, 9 Mar – 2 Oct 2026, active):
  - Only SCA: id=255, weekEnd=2026-07-03, classId=11 — 48 days without assignment
  - Student returns Tue 25 Aug 2026 (5 days from now)
  - SCA needed for week Mon 24 – Fri 28 Aug before first class back
Booking Course 1982 (AY Morning 2025, ended 19 Dec 2025, ACTIVE): 244d stale — deactivate

## Fix recipe (NOT YET RUN)

Step 1 (URGENT — before Mon 24 Aug): Create SCA on BC 24925
  Confirm classId=11 still correct with Paul/Adriana.
  INSERT INTO "StudentClassAssignment" ("bookingCourseId","studentId","classId","weekStart","weekEnd")
  VALUES (24925, 1001, 11, '2026-08-24', '2026-08-28');

Step 2: Deactivate stale BC 1982
  UPDATE "BookingCourse" SET active = false WHERE id = 1982;

Risk: low, single student, reversible. Deadline: Mon 24 Aug (4 days).
Status: URGENT. Returns Tue 25 Aug (5d). 181st check Thu 20 Aug 2026 UTC.
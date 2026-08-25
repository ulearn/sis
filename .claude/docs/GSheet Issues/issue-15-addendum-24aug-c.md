Issue 15 - Saikhantes: Missing Class Assignment (Addendum 24 Aug 2026-c)

Reporter: pg | Area: booking/class | Sheet row: 16 | Run: 498th (Mon 24 Aug 2026 UTC)

Symptom
Student in school with no valid class assignment. SCA expired 52 days ago (3 Jul 2026). G column edited since 497th run; underlying data unchanged.

Root Cause - Current State

Student: Saikhantes Shagdarsuren (ID: 1001)

SCA 255: Class 11 (B1 PM), weekEnd 2026-07-03 - expired 52 days ago (as of 24 Aug)
BC 24925: Academic Year Afternoon, 9 Mar to 2 Oct 2026, active - 39 days remaining
BC 1982: Academic Year Morning, ended 19 Dec 2025, still active - 248 days stale

No new SCA created since SCA 255 expired. Student attending class without valid SCA since 3 Jul 2026.

Fix Recipe (NOT YET RUN)

Step 1 - Insert new SCA for BC 24925 (next Monday after SCA 255 expired):
  INSERT INTO StudentClassAssignment (studentId, classId, weekStart, weekEnd, bookingCourseId, createdAt)
  VALUES (1001, 11, '2026-07-07', '2026-10-02', 24925, NOW());
  Verify class 11 is still active and correct before running.

Step 2 - Deactivate stale BC 1982:
  UPDATE BookingCourse SET active = false WHERE id = 1982;
  BC 1982 ended 19 Dec 2025, 0 class assignments - safe to deactivate.

Risk / Category
bookings / attendance | reversible | blast radius: single student | URGENT: student has had no valid SCA for 52 days

Status
Open - fix NOT RUN. CRITICAL. Last checked: 24 Aug 2026 UTC (498th run).
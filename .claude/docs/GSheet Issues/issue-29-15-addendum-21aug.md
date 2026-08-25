# Issue 29 & 15 — Saikhantes: No SCA Since Jul 3 (151st check Fri 21 Aug 2026)

**Reporter:** Antonella | **Area:** Booking / Class | **Sheet row:** 30
**Duplicate of:** Issue 15 (row 16)

## Root Cause (live DB, Fri 21 Aug 2026)

- Student 1001 (Saikhantes Shagdarsuren): Booking 18151 CONFIRMED, paid EUR 1,339.20
- Booking Course 24925 (Academic Year Afternoon): active, runs 9 Mar to 2 Oct 2026 (42d left)
- Only SCA: Assignment 255, class 11, weekEnd 3 Jul 2026 — SCA gap: 49 days
- No class assignment for any week from 6 Jul 2026 onwards
- Returns Tue 25 Aug 2026 — 2 school days to act: Fri 21 (today) + Mon 24 Aug

## Fix Recipe (NOT YET RUN)

1. Confirm class with Paul/Adriana (previously class 11, AY Afternoon)
2. Create SCA on BC 24925 via SIS admin, or:
   INSERT INTO student_class_assignment (bookingCourseId,classId,weekStart,weekEnd,createdAt,updatedAt) VALUES (24925, <classId>, '2026-07-06', '2026-10-02', NOW(), NOW())
3. Deactivate stale BC 1982 (ended Nov 2025, 245d stale):
   UPDATE booking_course SET active = false WHERE id = 1982

## URGENT
Student returns Tue 25 Aug. Only Fri 21 + Mon 24 remain. Fix NOT RUN.
**Last checked:** 2026-08-21 UTC (151st check)
---
152nd check 2026-08-21 Fri UTC (afternoon)

CONFIRMED UNCHANGED. SCA 255 (class 11 B1 PM, weekEnd 3 Jul 2026) still only record for BC 24925.
Returns Tue 25 Aug. Mon 24 Aug = last school day to assign. Fix NOT RUN.

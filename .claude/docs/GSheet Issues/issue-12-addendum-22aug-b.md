# Issue 12 addendum 22 Aug 2026 (192nd check)

Sheet row 13 | Reporter: AC | Area: Booking / Class

## Symptom
Rakan Alghamdi has no class assignment on his current booking course since Aug 3.

## Root cause (DB-verified 22 Aug 2026, 458th run)
- Student Class Assignment 288: student 14444 (Rakan Alghamdi), bookingCourseId = 24697 (wrong course)
- Booking Course 24697 (Academic Year Morning): active = true, ended 31 Jul 2026 — 22 days stale, 1 SCA still linked
- Booking Course 25035 (General English Academic Year AM Plus): active = true, starts 3 Aug 2026, ends 8 Jan 2027 — 0 class assignments, 19 days elapsed

The SCA was never migrated to the new booking course when it changed on Aug 3.

## Fix recipe (NOT YET RUN)
Step 1 — Move SCA to correct booking course:
  prisma.studentClassAssignment.update({ where: { id: 288 }, data: { bookingCourseId: 25035 } })

Step 2 — Deactivate stale booking course:
  prisma.bookingCourse.update({ where: { id: 24697 }, data: { active: false } })

## Risk / category
bookings / data-hygiene | reversible | blast radius = 1 student (Rakan Alghamdi)

## Status
Fix NOT RUN. 192nd check. Last checked: 2026-08-22 UTC.
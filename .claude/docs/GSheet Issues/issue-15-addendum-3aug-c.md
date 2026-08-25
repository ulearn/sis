# Issue 15 — Saikhantes Shagdasuren, Class Assignment on Return — 3 Aug 2026 UTC
Reporter: PG | Area: Booking/Class | Sheet row: 16 | SIS: 1001

Root cause (unchanged):
- Holiday 2500 (Jul20-Aug21 2026, bk18151): active — returns Mon 24 Aug (21 days)
- Last SCA: id 255, class 11, weekEnd=2026-07-03 — expired 31 days ago
- BC 24925 (Academic Year Afternoon, Mar9-Oct2 2026): active=true — needs SCA on return
- BC 1982 (Academic Year Morning, ended Dec19 2025): active=true — 228d stale

Fix recipe (NOT YET RUN):
Step 1 - Deactivate BC 1982 (run now): p.bookingCourse.update({where:{id:1982},data:{active:false}})
Step 2 - Create SCA on BC24925 week ending Aug28 (run on/around Aug24): p.studentClassAssignment.create({data:{bookingCourseId:24925,classId:11,weekEnd:new Date('2026-08-28')}}) — VERIFY classId

Risk: bookings, low blast radius (1 student). Reversible.
Status: OPEN — NOT RUN. Last checked: 2026-08-03 UTC (returns Aug24, 21 days)
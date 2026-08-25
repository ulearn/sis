# Issue 12 addendum 22 Aug 2026

## 190th check - no change since 189th (Fri 21 Aug)

SCA 288: student 14444 (Rakan Alghamdi), bookingCourseId = 24697 (wrong course)
BC 24697: active=true, ended 31 Jul 2026 -- 22 DAYS STALE
BC 25035 (correct): active=true, starts 3 Aug, ends 8 Jan 2027 -- 0 SCAs, 19 days elapsed

## Fix (NOT YET RUN)
1. prisma.studentClassAssignment.update id=288 set bookingCourseId=25035
2. prisma.bookingCourse.update id=24697 set active=false

Risk: reversible. Rakan missing class assignment on current course since Aug 3.
Last checked: 2026-08-22 UTC (190th check)

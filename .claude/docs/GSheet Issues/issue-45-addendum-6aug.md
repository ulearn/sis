# Issue 45 — Stale Booking Courses (renewal arrivals) (31st check)
Reporter: | Area: Renewal students | Sheet row: 47 | Checked: Thu 6 Aug 2026 UTC

## Symptom
Returning students not appearing on arrivals list even though their courses are correct.

## Root Cause — live data Thu 6 Aug 2026 UTC (unchanged from 30th check)

Total stale booking courses (active = true, endDate < now): 24,467 — unchanged.

Specifically tracked stale booking courses:
- Booking course 25006 (General English AM Plus, booking 18228): ended 2026-08-03 — 3 days stale, active = true, 2 class assignments
- Booking course 24630 (General English AM Plus, ended 2026-07-10): active = true — 27 days stale
- Booking course 24631 (General English AM Plus, ended 2026-07-10): active = true — 27 days stale

No new booking courses became stale on 4–5 Aug.

Root cause: active flag is never automatically set to false when endDate passes. The arrivals query filters on active = true, so ended-but-active booking courses still show students on the arrivals list.

## Fix Recipe (NOT YET RUN)

Immediate — deactivate the 3 specifically tracked stale booking courses:
  node --env-file=.env -e 'const {PrismaClient}=require("./dist/generated/prisma/client"); ... p.bookingCourse.updateMany({where:{id:{in:[25006,24630,24631]}},data:{active:false}})'

Batch (awaiting decision) — deactivate all 24,467 stale booking courses:
  p.bookingCourse.updateMany({where:{active:true,endDate:{lt:new Date()}},data:{active:false}})
  CAUTION: test on a small subset first; verify impact on any active arrivals query.

## Risk / Category
bookings / data-hygiene — reversible (can re-activate). Blast radius: up to 24,467 booking course records.

## Status
Open — 24,467 stale booking courses unchanged; awaiting Neil decision on batch deactivation.
Last checked: Thu 6 Aug 2026 UTC (31st hourly run)
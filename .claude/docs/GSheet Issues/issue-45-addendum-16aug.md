Issue 45 - Stale Booking Courses (100th check)
Reporter: various | Area: Renewals | Sheet row: 47 | Sun 16 Aug 2026 UTC

Root Cause (100th check - 16 Aug 2026 UTC)
- Stale active Booking Courses (end date before Aug 16 2026): 24,497 - unchanged from yesterday (99th check)
- Zero Booking Courses ended on Aug 16 - count stays at 24,497
- Fix script prepared by Neil; not yet run

Fix Recipe (NOT YET RUN)

Bulk deactivation via Prisma:
  await p.bookingCourse.updateMany({
    where: { active: true, endDate: { lt: new Date() } },
    data: { active: false }
  });

Risk: data-hygiene; reversible; approx 24,497 records

Status: Open - Fix NOT RUN
Last checked: 2026-08-16 UTC (100th check)
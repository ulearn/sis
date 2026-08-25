Issue 45 -- Renewal Students Not on Arrivals List
Reporter: AC/Staff | Area: Renewal students | Sheet row 47

Symptom
Returning students not appearing on arrivals list.
Stale active Booking Courses pollute the arrivals/class-assignment views.

Root cause
- Stale active BCs (endDate < 2026-08-23, active = true): 24,516
  (was 24,515 on 22 Aug -- increased by 1)
- Oldest: BC id 24047, endDate 1899-12-31 (migration artefact)

Fix recipe (NOT YET RUN)

Preview: SELECT COUNT(*) FROM booking_course WHERE active = true AND end_date < CURRENT_DATE;

Apply via Prisma:
  const result = await p.bookingCourse.updateMany({
    where: { active: true, endDate: { lt: new Date() } },
    data: { active: false }
  });

After running: spot-check 3-5 rows; verify arrivals list for renewal students.

Risk / category
- Category: bookings / data-hygiene
- Reversible: yes (set active = true to undo)
- Blast radius: 24,516 rows; UI views only; no financial impact

Status: OPEN -- Fix NOT RUN
Last checked: 2026-08-23 UTC (483rd run, 467th issue check)
Count: 24,516 (up from 24,515 on 22 Aug)
Issue 43 - Stale Booking Accommodations on Bed 83
Student: Jesus Manuel Ramirez Diaz (ID 14439) | Area: Booking / Accomm | Sheet row: 45
Last checked: 10 Aug 2026 UTC (21st hourly check)

SYMPTOM
Accommodation dates for the student should be June 20 to July 4.
Booking accommodations on bed 83 are not being deactivated after they end.

ROOT CAUSE (live DB 10 Aug 2026)
5 stale booking accommodations on bed 83 (active = true after end date passed):

BA 11239 | booking 22    | ended 2026-05-24 | 78 days stale | fee EUR 1,050 | active = true
BA 11168 | booking 92    | ended 2026-06-20 | 51 days stale | fee EUR 700   | active = true
BA 11285 | booking 17825 | ended 2026-07-05 | 36 days stale | fee = null    | active = true
BA 11352 | booking 18156 | ended 2026-07-11 | 30 days stale | fee EUR 360   | active = true
BA 11179 | booking 82    | ended 2026-08-09 | 1 day stale   | fee EUR 1,360 | active = true (newly stale)

Current and future on bed 83 - keep active:
BA 11173 | booking 88    | Aug 9-30 2026    | CURRENT
BA 25    | booking 17844 | Aug 30-Oct 11 2026 | FUTURE

FIX RECIPE - NOT YET RUN

Deactivate the 5 stale booking accommodations in SIS admin, or via Prisma:

  await prisma.bookingAccommodation.updateMany({
    where: { id: { in: [11239, 11168, 11285, 11352, 11179] } },
    data: { active: false }
  });
  (NOT YET RUN)

Verify BA 11173 (current) and BA 25 (future) remain active after the update.

RISK: Cosmetic / accommodation. Stale display entries, no financial impact. Fully reversible.

STATUS: Open - 5 stale booking accommodations, max 78 days stale. BA 11179 newly stale (ended Aug 9).
Last checked: 10 Aug 2026 UTC
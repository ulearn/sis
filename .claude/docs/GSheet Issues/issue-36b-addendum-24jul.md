Issue 36b — Stale Booking Accommodations With Beds — Addendum 24 Jul 2026
Reporter: (internal) | Area: Booking / Accomm | Sheet row: 38

Symptom
Booking accommodations with actual bed assignments remain active past their end date,
blocking bed reassignment.

Root cause (45th hourly check, 150th total — Fri 24 Jul 2026 UTC):
- Stale booking accommodations with beds (active = true, bedId not null, endDate < today):
  43 records — UNCHANGED from 44th check Thu 23 Jul 2026
- Most recently expired:
  BA 11265: bed 157, booking 1274, ended 19 Jul 2026
  BA 11365: bed 174, booking 18184, ended 18 Jul 2026
  BA 11257: bed 168, booking 7, ended 18 Jul 2026
  BA 11345: bed 89, booking 17826, ended 12 Jul 2026
  BA 11352: bed 83, booking 18156, ended 11 Jul 2026 (Issue 37 — Veronica)
- Total stale booking accommodations (all, including unassigned beds): ~11,176 — unchanged

Fix recipe — NOT YET RUN

Step 1: Deactivate all 43 stale booking accommodations with beds
DB command (NOT YET RUN):
  UPDATE bookingAccommodation SET active = false
  WHERE active = true
    AND bedId IS NOT NULL
    AND endDate < '2026-07-24'

Or via Prisma (NOT YET RUN):
  await p.bookingAccommodation.updateMany({
    where: { active: true, bedId: { not: null }, endDate: { lt: new Date('2026-07-24') } },
    data: { active: false }
  });

Step 2 (longer term): Schedule nightly cleanup for the 11k+ unassigned stale BAs
Set up a cron job or Prisma migration to deactivate booking accommodations
where active = true and endDate < today.

Risk / Category
- Category: Data hygiene — accommodation records
- Reversible: Yes (can set active = true again if needed)
- Blast radius: 43 records with beds; beds become available for reassignment
- Urgency: Medium — cosmetic/operational but not student-blocking

Status: NOT YET RUN.
Last checked: Fri 24 Jul 2026 UTC (45th issue check, 150th total hourly run)
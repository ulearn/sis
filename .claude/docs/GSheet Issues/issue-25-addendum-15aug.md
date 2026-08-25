# Issue 25 — Uyanga Tungalag (visa null; 0 SCAs; Day 110)
Reporter: AC | Area: Visa/Class | Row 26 | 162nd check Sat 15 Aug 2026 UTC — no change

ROOT CAUSE (live data, verified 15 Aug 2026):
- Student 917 (Uyanga Tungalag): visaStatus = null, hubspotContactId = null — last updated 28 Jul 2026 (18 days ago)
- Booking 1467: CONFIRMED, confirmed = true, fully paid EUR 2,405, amountOpen = 0 — booking OK
- Booking Course 1613 (Academic Year Morning): 2026-04-27 to 2026-10-30, active, 0 class assignments
- Day 110 in course without any class assignment (started 27 Apr 2026)

FIX RECIPE (NOT YET RUN):
1. Set visa status on student 917:
   UPDATE student SET visa_status = 'approved' WHERE id = 917;
   (Check prisma schema enum for exact string value.)
2. Assign BC 1613 to the correct Academic Year Morning class via admin UI
   (Admin UI -> Student 917 -> Booking 1467 -> BC 1613 -> assign class).
3. Link HubSpot contact: look up Uyanga Tungalag in HubSpot, get contact ID, then:
   UPDATE student SET hubspot_contact_id = '<ID>' WHERE id = 917;

RISK: Data hygiene; reversible. Blast radius: 1 student, 1 new SCA.
STATUS: OPEN — no change. Fix NOT RUN. Day 110.
Last checked: Sat 15 Aug 2026 UTC (162nd check)
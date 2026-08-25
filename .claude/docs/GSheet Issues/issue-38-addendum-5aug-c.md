# Issue 38 — Unassigned Booking Courses (18th check)

Reporter: PG | Area: Holidays, Bookings | Sheet row 40 | Last checked: 2026-08-05 UTC

## URGENT: BCs ending FRIDAY 7 Aug 2026 (2 days) — still 0 SCAs

BC 88: Africa Mera Bachir, Morning General, 0 SCAs — URGENT
BC 24967: Gustavo Da Silva, General English AM, 0 SCAs — URGENT
BC 25038: Eduardo Roche Diaz, General English PM, 0 SCAs — URGENT

NEW ANOMALY — BC 24967: Gustavo Da Silva also has BC 24955 (General English AM Plus,
2 SCAs, same end date Aug 7). Two active courses for same student ending same day.
Possible dual-enrolment data error. Clarify before assigning BC 24967.

## BCs ending THURSDAY 14 Aug 2026 — all 0 SCAs

BC 24: Amine Ibrani, Academic Year Afternoon, 0 SCAs
BC 1144: Anar-Erdene Batbayar, Academic Year Morning, 0 SCAs
BC 1305: Nomin Nergui, Academic Year Morning, 0 SCAs
BC 1344: BAt-Orgil Baljinnyam, Academic Year Morning, 0 SCAs
BC 1572: Ganchimeg Ganbaatar, Academic Year Afternoon, 0 SCAs
BC 1591: Turbold Altankhuyag, Academic Year Morning, 0 SCAs
BC 25004: Vincenzo Contu, General English AM Plus, 0 SCAs
BC 25005: Claudia Mereu, General English AM, 0 SCAs

Already assigned Aug 14 BCs (OK — SCA count >= 1):
BC 1739, 1687, 1755, 24599, 24627, 1594, 1685, 24695, 24964.

## Fix recipe (NOT YET RUN)

Step 1 — Investigate dual enrolment: Gustavo Da Silva has BC 24955 (2 SCAs) and
BC 24967 (0 SCAs), both General English, both ending Aug 7. Determine which is correct.
Deactivate the duplicate via SIS admin > Booking > Booking Courses.

Step 2 — TODAY: assign final week SCAs for Aug 7-ending BCs.
SIS admin > Classes > Assign. Week ending 2026-08-07.
Assign: BC 88 (Africa Mera Bachir), BC 25038 (Eduardo Roche Diaz),
and BC 24967 only after Step 1 confirms it is the correct course.

Step 3 — By Mon 10 Aug: assign final week SCAs for Aug 14-ending BCs.
Week ending 2026-08-14. Assign: BC 24, 1144, 1305, 1344, 1572, 1591, 25004, 25005.

Risk: bookings / class-assignment | Reversible: yes | Blast radius: low
Status: OPEN — 18th check 2026-08-05 UTC. NOT YET RUN.
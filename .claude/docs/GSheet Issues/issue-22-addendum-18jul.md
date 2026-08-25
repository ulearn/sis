# Issue 22 Addendum — 18 Jul 2026 (Saturday)

Sheet row: 23 | Reporter: PG | Area: Booking / Class

---

73rd check Saturday 18 July 2026 UTC (15th today)

CONFIRMED UNCHANGED (fresh DB). Booking course 24991 (Edith Nunes, student 1015, General English AM, 13 Jul – 7 Aug 2026): STILL 0 class assignments.
Week 1 (Mon 13 Jul to Fri 17 Jul): permanently missed.
Week 2 (Mon 20 Jul to Fri 24 Jul): starts in 2 days (Monday 20 July — NOT tomorrow; today is Saturday).
Stale booking courses: 24933 + 24934 (ended Jul 10, 8 days stale), BC1797 (ended Jun 26, 22 days stale) — all still active=true.

Correction from earlier today: previous runs said "starts TOMORROW Monday 20 July" — incorrect. Today is Saturday; tomorrow is Sunday 19 July. Monday 20 July is 2 days away.

Fix recipe — NOT YET RUN:
1. SIS Admin > Classes > To Be Assigned — assign student 1015 (Edith Nunes) to a class on booking course 24991 (General English AM, runs to 7 Aug 2026). 3 weeks remain (Jul 20 – Aug 7).
2. Deactivate booking course 24933: UPDATE booking_courses SET active=false WHERE id=24933;
3. Deactivate booking course 24934: UPDATE booking_courses SET active=false WHERE id=24934;
4. Deactivate booking course 1797: UPDATE booking_courses SET active=false WHERE id=1797;

Risk: class assignment — reversible. Week 1 attendance (Jul 13–17) permanently unrecoverable.

Status: CRITICAL — week 2 starts Monday 20 July 2026. Fix NOT YET RUN.
Last checked: Saturday 18 July 2026 UTC (73rd check, 15th today, hourly bot).

---
74th check 2026-07-18 SAT UTC (16th today)

CONFIRMED UNCHANGED (fresh DB). Booking course 24991 (Edith Nunes, student 1015, General English AM, 13 Jul – 7 Aug 2026): STILL 0 class assignments. Week 1 (Mon 13 – Fri 17 Jul): permanently missed. Week 2 (Mon 20 – Fri 24 Jul): starts in 2 days. Stale booking courses: 24933 + 24934 (ended Jul 10, 8d stale), BC1797 (ended Jun 26, 22d stale) — all still active=true. Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (74th check, 16th today, hourly bot).

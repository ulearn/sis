# Issue 22 Addendum - 16 July 2026 (Thursday)

Sheet row: 23 | Reporter: PG | Area: Booking / Class

---

51st check - 2026-07-16 THU UTC (9th check today)

CONFIRMED UNCHANGED (fresh DB). Edith Nunes (student 1015) still has zero class assignments on booking course 24991. Day 4 of course.

DB snapshot (live, 16 Jul UTC):
- Booking course 24991 (General English AM, 13 Jul to 7 Aug 2026): active=true, 0 class assignments
  Days 1-4 unassigned: Monday 13, Tuesday 14, Wednesday 15, Thursday 16 July
- Booking 18214: Confirmed, confirmed=true, EUR 608 / EUR 608 (fully paid)
- Payment 18004: EUR 608, type = null (unclassified)
- Booking course 24933 (General English AM, ended 10 Jul 2026): active = STILL true — 6 days stale
- Booking course 24934 (General English AM, ended 10 Jul 2026): active = STILL true — 6 days stale

TOMORROW (Friday 17 July) is the last day of this week — entire first week missed if no assignment today.

Fix recipe — NOT YET RUN:

1. SIS Admin > Classes > To Be Assigned — assign student 1015 (Edith Nunes) to a class on booking course 24991 (General English AM). Course runs through 7 August 2026.
2. Deactivate booking course 24933: set active = false (ended 10 Jul, 6 days stale)
3. Deactivate booking course 24934: set active = false (ended 10 Jul, 6 days stale)
4. Set payment 18004 type to appropriate category (Bank Transfer / Stripe / etc.)

Risk: class — reversible. Missed day attendance is unrecoverable.

Status: UNRESOLVED. Last checked: 2026-07-16 THU UTC (51st check, hourly bot).

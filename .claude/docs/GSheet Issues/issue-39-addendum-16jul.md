# Issue 39 Addendum - 16 July 2026 (Thursday)

Sheet row: 41 | Reporter: KC | Area: Booking / Accomm / Class

---

37th check - 2026-07-16 THU UTC (10th check today)

CONFIRMED UNCHANGED (fresh DB). Xuezhen Huang (student 14443) still has zero class assignments on booking course 24609. Day 4 of course (Mon–Thu all missed).

DB snapshot (live, 16 Jul UTC):
- Booking course 24609 (Morning General, 13 Jul to 31 Jul 2026): active=true, 0 class assignments
  Days 1-4 unassigned: Monday 13, Tuesday 14, Wednesday 15, Thursday 16 July
- Booking 17831: Confirmed, confirmed=true, EUR 1396.90 / EUR 1396.90 (fully paid, amount open = EUR 0)
- Booking accommodation 11358: bed 180, host Mary Carver, 12 Jul to 2 Aug 2026, active=true, fee=EUR 900
- Payments on booking 17831: IDs 17180, 17987, 17988, 17963 — all type = null

Accommodation status: RESOLVED. Bed 180 (Mary Carver, accommodation 11358) correctly in SIS.

Remaining issue: class assignment only.

TOMORROW (Friday 17 July) is the last day of this week — entire first week missed if no class assignment today.

Fix recipe — NOT YET RUN:

1. SIS Admin > Classes > To Be Assigned — assign student 14443 (Xuezhen Huang) to a class on booking course 24609 (Morning General). Course runs through 31 July 2026.
2. Set payment types for payments 17180, 17987, 17988, 17963 (all currently type=null) — lower priority.

Risk: class — reversible. Missed day attendance is unrecoverable.

Status: UNRESOLVED (class only; accommodation resolved). Last checked: 2026-07-16 THU UTC (37th check, hourly bot).
# Issue 39 Addendum — 17 July 2026 (Friday)

Sheet row: 41 | Reporter: KC | Area: Booking / Accomm / Class

---

42nd check — 2026-07-17 FRI UTC

Xuezhen Huang (student 14443): full first week of course 24609 (Morning General, Jul 13-31 2026) ended Friday 17 July with ZERO class assignments throughout.

DB snapshot (fresh, 17 Jul UTC):
- Booking course 24609 (Morning General, 13 Jul to 31 Jul 2026): active=true, 0 class assignments
  Full week 1 missed: Mon 13 Jul, Tue 14 Jul, Wed 15 Jul, Thu 16 Jul, Fri 17 Jul — all unassigned
- Booking 17831: Confirmed, confirmed=true, EUR 1396.90 / EUR 1396.90 (fully paid, amount open = EUR 0)
- Booking accommodation 11358: bed 180, host Mary Carver, 12 Jul to 2 Aug 2026, active=true, fee=EUR 900 — correct
- Payments on booking 17831: IDs 17180, 17987, 17988, 17963 — all type = null (lower priority)

2 weeks of course remain: Mon 20 July to Fri 31 July 2026.

Fix recipe (NOT YET RUN):

1. SIS Admin > Classes > To Be Assigned: assign student 14443 (Xuezhen Huang) to a Morning General class on booking course 24609. Course runs to 31 July 2026. Entire week 1 attendance is already missed — assign for weeks 2-3 minimum.

2. (Lower priority) Set payment types for payments 17180, 17987, 17988, 17963 (all currently type=null) via SIS admin.

Risk: class assignment — reversible. Missed attendance records for week 1 (Jul 13-17) are unrecoverable.

Status: UNRESOLVED (class assignment only; accommodation resolved). Last checked: 2026-07-17 FRI UTC (42nd check, hourly bot).

---
43rd check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24609 (Xuezhen Huang, student 14443, Morning General, Jul13-Jul31): 0 class assignments after full first week (Mon 13 to Fri 17 Jul). 2 weeks of course remain (Jul 20 to 31). Booking accommodation 11358 (bed 180, host Mary Carver, Jul12-Aug2): active=true, fee=EUR 900 — correct. Fix NOT RUN.
Status: UNRESOLVED. Last checked: 2026-07-17 FRI UTC (43rd check, hourly bot).


---
45th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB).
Booking course 24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul to 31 Jul 2026): STILL 0 class assignments.
Full week 1 (Mon 13 Jul to Fri 17 Jul): missed — attendance unrecoverable.
2 weeks remain: Mon 20 Jul to Fri 31 Jul 2026.
Today (Fri 17 Jul) is the LAST WORKING DAY before week 2 begins.
Accommodation 11358 (bed 180, host Mary Carver, Jul 12 to Aug 2): active=true, fee=EUR 900 — correct.
Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (45th check, hourly bot).
---
46th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). BC24609 (Xuezhen Huang, student 14443, Morning General, Jul13-Jul31 2026): STILL 0 class assignments. Week 1 (Mon 13 Jul to Fri 17 Jul) ended with zero assignments — attendance permanently missed. Week 2 (Jul 20-24) starts Monday — today (Fri) is the last working day to assign. BA11358 (bed 180, host Mary Carver, Jul12-Aug2, fee=EUR 900): active=true, correct. Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (46th check, hourly bot).

---
47th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24609 (Xuezhen Huang, student 14443, Morning General, Jul13-31 2026): STILL 0 class assignments. Week 1 (Mon 13 Jul to Fri 17 Jul) ended — attendance permanently missed. Week 2 (Jul 20-24) starts Monday. TODAY (Fri) IS THE LAST WORKING DAY to assign. Booking accommodation 11358 (bed 180, host Mary Carver, Jul12-Aug2, fee=EUR 900): active=true, correct. Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (47th check, hourly bot).

---
48th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul to 31 Jul 2026): STILL 0 class assignments. Full week 1 (Mon 13 Jul to Fri 17 Jul) ended - attendance permanently missed. Week 2 (Jul 20-24) starts Monday. TODAY (Fri) IS THE LAST WORKING DAY to assign. Accommodation 11358 (bed 180, host Mary Carver, Jul12-Aug2, fee=EUR 900): active=true, correct. Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (48th check, hourly bot).

---
49th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul to 31 Jul 2026): STILL 0 class assignments. Week 1 (Mon 13 Jul to Fri 17 Jul) ended — attendance permanently missed. Week 2 (Mon 20-24 Jul) starts Monday. TODAY IS THE LAST WORKING DAY to assign. Booking accommodation 11358 (bed 180, host Mary Carver, Jul 12-Aug 2, fee EUR 900): active=true, correct. Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (49th check, hourly bot).
---
50th check 2026-07-17 FRI 18:00 UTC

CONFIRMED UNCHANGED (carrying forward 49th-check data, 17:09 UTC). Booking course 24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul to 31 Jul 2026): STILL 0 class assignments. Week 1 (Mon 13 to Fri 17 Jul) ended — attendance permanently missed. Week 2 (Jul 20-24) starts Monday. TODAY IS THE FINAL EVENING BEFORE MONDAY — last window to assign. Accommodation 11358 (bed 180, host Mary Carver, Jul12-Aug2, fee EUR 900): active=true, correct. Fix NOT RUN.
Last checked: 2026-07-17 FRI 18:00 UTC (50th check, hourly bot).

---
51st check 2026-07-17 FRI 19:03 UTC (EOD CONFIRMED)

BUSINESS HOURS OVER. Booking course 24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul to 31 Jul 2026): 0 class assignments — confirmed at EOD. Week 1 (Mon 13 Jul to Fri 17 Jul) PERMANENTLY MISSED — unrecoverable. No assignment made today. Week 2 (Mon 20-24 Jul) starts Monday. Action required first thing Monday 20 July. Accommodation 11358 (bed 180, host Mary Carver, Jul12-Aug2, EUR 900): active=true, correct. Fix NOT RUN.
Status: UNRESOLVED — MONDAY ACTION REQUIRED. Last checked: 2026-07-17 FRI 19:03 UTC (51st check, hourly bot).
---
52nd check 2026-07-17 FRI UTC (this run)
CONFIRMED UNCHANGED (fresh DB). BC24609 (Xuezhen Huang s14443 Morning General Jul13-Jul31 2026): sca_count=STILL 0. Week1 (Jul13-17) ended — attendance permanently missed. Week2 (Jul20-24) starts Mon. BA11358 bed180 host Mary Carver Jul12-Aug2 EUR900 correct. Business hours over. Fix NOT RUN. Assign first thing Monday 20 July.
Last checked: 2026-07-17 FRI UTC (52nd check, hrly bot).

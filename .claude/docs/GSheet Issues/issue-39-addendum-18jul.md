# Issue 39 Addendum — 18 Jul 2026 (Saturday)

Sheet row: 41 | Reporter: KC | Area: Booking / Accomm / Class | Check: 55th (3rd today)

---

**55th check Saturday 18 July 2026 UTC (3rd check today)**

Booking course 24609 (Xuezhen Huang, student 14443, Morning General, 13 July to 31 July 2026):
STILL 0 class assignments (fresh DB, Sat 18 Jul).

- Full week 1 (Mon 13 Jul to Fri 17 Jul): ended with zero assignments — attendance permanently missed
- Week 2 (Mon 20 Jul to Fri 24 Jul): starts Monday — assign before 09:00
- Week 3 (Mon 27 Jul to Fri 31 Jul): final week of course

Booking 17831: CONFIRMED, confirmed=true, EUR 1396.90 / EUR 1396.90 (fully paid, amountOpen=0).
Booking accommodation 11358 (bed 180, host Mary Carver, 12 Jul to 2 Aug 2026, fee=EUR 900): active=true — correct (checkout still future).

---

Fix recipe — NOT YET RUN

BEFORE 09:00 MONDAY 20 JULY 2026:

1. SIS Admin > Classes > To Be Assigned:
   Assign student 14443 (Xuezhen Huang) to a Morning General class on booking course 24609.
   Course runs to 31 July 2026 (2 weeks remain).
   Week 1 (Jul 13-17) is permanently missed — no attendance recovery possible.

2. (Lower priority) Set payment types for payments 17180, 17987, 17988, 17963 on booking 17831 (all type=null).

Risk: class assignment | reversible | 2 weeks of attendance saved if assigned Monday.

Status: CRITICAL — week 2 starts Monday 20 July. Fix NOT YET RUN.
Last checked: Saturday 18 July 2026 UTC (55th check, 3rd today, hourly bot).

---
56th check Saturday 18 July 2026 UTC (4th today)

CONFIRMED UNCHANGED (fresh DB). Booking course 24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul to 31 Jul 2026): STILL 0 class assignments. Week 1 (Mon 13-Fri 17 Jul) PERMANENTLY MISSED. Week 2 (Mon 20-24 Jul) starts Monday — assign before 09:00. Booking accommodation 11358 (bed 180, Mary Carver, Jul 12-Aug 2, EUR 900): correct. Fix NOT RUN.
Status: CRITICAL — week 2 starts Monday 20 July. Fix NOT RUN.
Last checked: Saturday 18 July 2026 UTC (56th check, 4th today, hourly bot).

---
57th-59th checks Saturday 18 July 2026 UTC (5th-7th today)

CONFIRMED UNCHANGED each check (fresh DB). BC24609 Xuezhen Huang, student 14443, Morning General (13 Jul - 31 Jul 2026): STILL 0 class assignments.
Week 1 (Mon 13 - Fri 17 Jul): permanently missed.
Week 2 (Mon 20 - Fri 24 Jul): STARTS TOMORROW - assign before Monday 09:00.
Booking accommodation 11358 (bed 180, Mary Carver, 12 Jul - 2 Aug 2026, EUR 900): active = true, correct.
Fix NOT RUN as of 59th check.
Last checked: Saturday 18 July 2026 UTC (59th check, 7th today, hourly bot).

---
60th-61st checks Saturday 18 July 2026 UTC (8th-9th today)

CONFIRMED UNCHANGED (fresh DB both checks). Booking course 24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul to 31 Jul 2026): STILL 0 class assignments.
Week 1 (Mon 13 Jul to Fri 17 Jul): permanently missed.
Week 2 (Mon 20 to Fri 24 Jul): STARTS TOMORROW — assign before Monday 09:00.
Booking accommodation 11358 (bed 180, Mary Carver, 12 Jul to 2 Aug 2026, EUR 900): active = true, correct.
Fix NOT RUN as of 61st check.
Last checked: Saturday 18 July 2026 UTC (61st check, 9th today, hourly bot).

---
62nd check 2026-07-18 SAT UTC (10th today)

CONFIRMED UNCHANGED (fresh DB). BC24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul–31 Jul 2026): STILL 0 class assignments. Week 1 (Mon 13–Fri 17 Jul) PERMANENTLY MISSED. Week 2 (Mon 20–24 Jul) starts TOMORROW — assign before Monday 09:00. Booking accommodation 11358 (bed 180, Mary Carver, 12 Jul–2 Aug, EUR 900): active=true — correct. Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (62nd check, 10th today, hourly bot).

---
63rd-66th checks 2026-07-18 SAT UTC (11th-14th today)

CONFIRMED UNCHANGED each check (fresh DB). BC24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul - 31 Jul 2026): STILL 0 class assignments. visa status = STILL null (possible root cause — may block appearance in class-to-be-assigned list). Week 1 (Mon 13 - Fri 17 Jul): permanently missed. Week 2 (Mon 20 - Fri 24 Jul): STARTS TOMORROW — assign before Monday 09:00. Booking accommodation 11358 (bed 180, Mary Carver, 12 Jul - 2 Aug 2026, EUR 900): active=true, correct. Booking 17831: Confirmed EUR 1396.90/1396.90 fully paid. 2 weeks remain (Jul 20-31). Fix NOT RUN as of 66th check.
Last checked: 2026-07-18 SAT UTC (66th check, 14th today, hourly bot).

---
67th check 2026-07-18 SAT UTC (15th today)

CONFIRMED UNCHANGED (fresh DB). Booking course 24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul – 31 Jul 2026): STILL 0 class assignments. Week 1 (Mon 13–Fri 17 Jul): permanently missed. Week 2 (Mon 20–24 Jul): starts in 2 days (Monday 20 July — not tomorrow; today is Saturday). Booking accommodation 11358 (bed 180, Mary Carver, 12 Jul–2 Aug, EUR 900): active=true — correct. Visa status = STILL null (possible root cause — may block class-to-be-assigned list). Booking 17831: Confirmed EUR 1396.90/1396.90 fully paid. Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (67th check, 15th today, hourly bot).

---
68th check 2026-07-18 SAT UTC (16th today)

CONFIRMED UNCHANGED (fresh DB). BC24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul – 31 Jul 2026): STILL 0 class assignments. Week 1 (Mon 13–Fri 17 Jul): permanently missed. Week 2 (Mon 20–24 Jul): 2 days away. Visa status = STILL null. Booking accommodation 11358 (bed 180, Mary Carver, 12 Jul–2 Aug, EUR 900): correct, active=true. Booking 17831: Confirmed EUR 1396.90 fully paid. 2 weeks remain (Jul 20–31). Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (68th check, 16th today, hourly bot).

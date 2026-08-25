# Issue 22 Addendum — 17 July 2026 (Friday)

Sheet row: 23 | Reporter: PG | Area: Booking / Class

---

56th check — 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Edith Nunes (student 1015) ended week 1 of booking course 24991 with ZERO class assignments throughout.

DB snapshot (live, 17 Jul UTC):
- Booking course 24991 (General English AM, 13 Jul to 7 Aug 2026): active=true, 0 class assignments
  Full week 1 missed: Mon 13, Tue 14, Wed 15, Thu 16, Fri 17 July — all unassigned
- Booking 18214: Confirmed, confirmed=true, EUR 608 / EUR 608 (fully paid)
- Payment 18004: EUR 608, type = null (unclassified)
- Booking course 24933 (General English AM, ended 10 Jul 2026): active = STILL true — 7 days stale
- Booking course 24934 (General English AM, ended 10 Jul 2026): active = STILL true — 7 days stale

3 weeks of course remain: Mon 20 July to Fri 7 August 2026. Week 1 attendance is permanently missed.

Fix recipe — NOT YET RUN:

1. SIS Admin > Classes > To Be Assigned — assign student 1015 (Edith Nunes) to a class on booking course 24991 (General English AM). Course runs through 7 August 2026. Assign for remaining weeks 2-4 (20 Jul – 7 Aug).
2. Deactivate booking course 24933: set active = false (ended 10 Jul, 7 days stale)
3. Deactivate booking course 24934: set active = false (ended 10 Jul, 7 days stale)
4. Set payment 18004 type to appropriate category (Bank Transfer / Stripe / etc.)

Risk: class — reversible. Missed attendance records for week 1 (Jul 13–17) are unrecoverable.

Status: UNRESOLVED. Last checked: 2026-07-17 FRI UTC (56th check, hourly bot).
---
58th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). BC24991 (Edith Nunes, student 1015, General English AM, Jul13-Aug7 2026): STILL 0 class assignments. Full week 1 (Mon 13 Jul to Fri 17 Jul) ended — attendance permanently missed. Week 2 (Jul 20-24) starts Monday. Booking 18214: Confirmed EUR 608/608. BC24933 + BC24934 ended Jul10 active=STILL true (7 days stale). Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (58th check, hourly bot).

---
59th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24991 (Edith Nunes, student 1015, General English AM, Jul13-Aug7 2026): STILL 0 class assignments. Week 1 (Mon 13 Jul to Fri 17 Jul) ended — attendance permanently missed. Week 2 (Jul 20-24) starts Monday. BC24933 + BC24934 (ended Jul 10): both still active=true (7 days stale). Payment 18004 (EUR 608): type=null (unclassified). Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (59th check, hourly bot).

---
60th check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24991 (Edith Nunes, student 1015, General English AM, Jul13-Aug7 2026): STILL 0 class assignments. Full week 1 (Mon 13 Jul to Fri 17 Jul) ended - attendance permanently missed. Week 2 (Jul 20-24) starts Monday. Booking courses 24933 + 24934 (ended Jul 10): both active=STILL true (7 days stale). Payment 18004 (EUR 608): type=null (unclassified). Course ends Aug 7 - 3 weeks remain if assigned Monday. Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (60th check, hourly bot).

---
61st check 2026-07-17 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24991 (Edith Nunes, student 1015, General English AM, Jul 13-Aug 7 2026): STILL 0 class assignments. Week 1 (Mon 13-Fri 17 Jul) ended - attendance permanently missed. Week 2 (Mon 20-24 Jul) starts Monday - today is last day to assign. Booking courses 24933 + 24934 (ended Jul 10): both active=STILL true (7 days stale). Payment 18004 (EUR 608): type=null (unclassified). Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (61st check, hourly bot).
---
62nd check 2026-07-17 FRI 18:00 UTC

CONFIRMED UNCHANGED (carrying forward 61st-check data, 17:09 UTC). Booking course 24991 (Edith Nunes, student 1015, General English AM, Jul 13-Aug 7 2026): STILL 0 class assignments. Week 1 (Mon 13-Fri 17 Jul) ended — attendance permanently missed. Week 2 (Jul 20-24) starts Monday — today is last day to assign. 3 weeks remain (Jul 20-Aug 7). Booking courses 24933 + 24934 (ended Jul 10): both active=STILL true (7d stale). Payment 18004 (EUR 608): type=null (unclassified). Fix NOT RUN.
Last checked: 2026-07-17 FRI 18:00 UTC (62nd check, hourly bot).

---
63rd check 2026-07-17 FRI 19:03 UTC (EOD CONFIRMED)

BUSINESS HOURS OVER. Booking course 24991 (Edith Nunes, student 1015, General English AM, 13 Jul to 7 Aug 2026): 0 class assignments — confirmed at EOD. Week 1 (Mon 13 Jul to Fri 17 Jul) PERMANENTLY MISSED — unrecoverable. No assignment made today. Week 2 (Mon 20-24 Jul) starts Monday. 3 weeks of course remain (20 Jul to 7 Aug). Booking courses 24933 + 24934 (ended Jul 10): both active=STILL true (7 days stale). Payment 18004 (EUR 608): type=null (unclassified). Fix NOT RUN.
Status: UNRESOLVED — MONDAY ACTION REQUIRED. Last checked: 2026-07-17 FRI 19:03 UTC (63rd check, hourly bot).

---
65th check 2026-07-18 SAT UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24991 (Edith Nunes, student 1015, General English AM, 13 Jul to 7 Aug 2026): STILL 0 class assignments. Week 1 (Mon 13 Jul to Fri 17 Jul) PERMANENTLY MISSED. Week 2 (Mon 20-24 Jul) starts Monday — assign before 09:00. Booking courses 24933 + 24934 (ended Jul 10): both active=STILL true (8 days stale). Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (65th check, hourly bot).

---
66th check 2026-07-18 SAT UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24991 (Edith Nunes, student 1015, General English AM, 13 Jul to 7 Aug 2026): STILL 0 class assignments. Week 1 (Mon 13-Fri 17 Jul) PERMANENTLY MISSED. Week 2 (Mon 20-24 Jul) starts Monday — assign before 09:00. Booking courses 24933 and 24934 (ended Jul 10): both active=STILL true (8 days stale). Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (66th check, hourly bot).

---
67th check 2026-07-18 SAT UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24991 (Edith Nunes, student 1015, General English AM, 13 Jul to 7 Aug 2026): STILL 0 class assignments.
Clarification: Edith has 2 class assignments globally (SCA 48 on BC1751 week Mar 30-Apr 17; SCA 146 on BC24668 week Apr 20-May 15) — both on old booking courses from earlier in 2026. Zero class assignments on current BC24991.
Week 1 (Mon 13 Jul to Fri 17 Jul): permanently missed.
Week 2 (Mon 20-24 Jul): starts TOMORROW — assign before 09:00.
Booking courses 24933 + 24934 (ended Jul 10): both active=STILL true (8d stale). Booking course 1797 (ended Jun 26): active=STILL true (22d stale).
Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (67th check, hourly bot).

---
68th check 2026-07-18 SAT UTC (10th today)

CONFIRMED UNCHANGED (fresh DB). BC24991 (Edith Nunes, student 1015, General English AM, 13 Jul–7 Aug 2026): STILL 0 class assignments. Week 1 (Mon 13–Fri 17 Jul) PERMANENTLY MISSED. Week 2 (Mon 20–Fri 24 Jul) starts TOMORROW — assign before 09:00. Stale BCs 24933 + 24934 (ended Jul10, 8d stale) and BC1797 (ended Jun26, 22d stale): all still active=true. Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (68th check, 10th today, hourly bot).

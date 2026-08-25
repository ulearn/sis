# Issue 45 Addendum — 18 Jul 2026 (Saturday)

Sheet row: 47 | Reporter: AC | Area: Renewal students | Check: 136th (3rd today)

---

**136th check Saturday 18 July 2026 UTC (3rd check today)**

All 7 Monday 20 July starters CONFIRMED STILL 0 class assignments (fresh DB, Sat 18 Jul UTC).

BC1630  Saranzaya Khishigbayar    AY Afternoon    Jul 20 – Jan 8 2027   bk1481  fee=EUR 2620    SCAs=0
BC24616 Mia Wehrli                GE AM Plus      Jul 20–31             bk17842 fee=null         SCAs=0  (bk17842 CONF EUR 1149.90 fully paid)
BC24686 Alberto Squillace         Morning General Jul 20 – Sep 18       bk1611  fee=null         SCAs=0  (see Issue 24)
BC24942 Lorena Pizarro Araya      AY Morning      Jul 20 – Jan 22 2027  bk18166 fee=EUR 2362.50 SCAs=0
BC24966 Filippo Corazzini         GE AM Plus      Jul 20 – Aug 7        bk18190 fee=EUR 549.90  SCAs=0
BC24989 Marcos Abrego Tofe        GE AM           Jul 20–24             bk18212 fee=EUR 152     SCAs=0  (1 week only)
BC25000 Giorgio Sau               GE AM Plus      Jul 20 – Aug 21       bk18223 fee=EUR 940     SCAs=0

BC24967 Gustavo Da Silva (GE AM Jul 6 – Aug 7, bk18179, CONF EUR 1014.60 paid, fee=EUR 137.60):
  STILL 0 class assignments — 12 days into course, 20 days remain. Assign urgently.

Holds — do NOT assign:
  BC24932 Stephany Martins Pardinho: PENDING booking 18157 (Life Pass Morning 105 weeks Jul 2026–Aug 2028)
  BC25001 Neil Mc Mahon: PENDING booking 18224 (admin/test record)

---

Fix recipe — NOT YET RUN

BEFORE 09:00 MONDAY 20 JULY 2026:

1. SIS Admin > Classes > To Be Assigned (or student profile > booking > booking course):
   Assign each of the 7 Mon 20 Jul starters to their class.

2. BC24616 Mia Wehrli: fee=null on the booking course. Set fee before assigning:
   UPDATE BookingCourse SET fee = <amount from HubSpot deal> WHERE id = 24616;

3. BC24686 Alberto Squillace: fee=null — see Issue 24 recipe for context.

4. BC24967 Gustavo Da Silva: assign urgently (12 days missed, 20 days remain).

Status: CRITICAL — classes begin Monday 20 July 2026. Fix NOT YET RUN.
Last checked: Saturday 18 July 2026 UTC (136th check, 3rd today, hourly bot).

---
137th check Saturday 18 July 2026 UTC (4th today)

All 7 Monday 20 July starters CONFIRMED STILL 0 class assignments (fresh DB, Sat 18 Jul UTC).

BC1630  Saranzaya Khishigbayar    AY Afternoon    Jul 20 — bk1481  fee=EUR 2620    SCAs=0
BC24616 Mia Wehrli                GE AM Plus      Jul 20-31       bk17842 fee=null         SCAs=0
BC24686 Alberto Squillace         Morning General Jul 20-Sep18    bk1611  fee=null         SCAs=0
BC24942 Lorena Pizarro Araya      AY Morning      Jul 20-Jan 22   bk18166 fee=EUR 2362.50  SCAs=0
BC24966 Filippo Corazzini         GE AM Plus      Jul 20-Aug 7    bk18190 fee=EUR 549.90   SCAs=0
BC24989 Marcos Abrego Tofe        GE AM           Jul 20-24       bk18212 fee=EUR 152      SCAs=0
BC25000 Giorgio Sau               GE AM Plus      Jul 20-Aug 21   bk18223 fee=EUR 940      SCAs=0
BC24967 Gustavo Da Silva          GE AM           Jul 6-Aug 7     bk18179 fee=EUR 137.60   SCAs=0 (12 days missed)

Status: CRITICAL — classes begin Monday 20 July 2026. Fix NOT YET RUN.
Last checked: Saturday 18 July 2026 UTC (137th check, 4th today, hourly bot).

---
138th-140th checks Saturday 18 July 2026 UTC (5th-7th today)

CONFIRMED UNCHANGED each check (fresh DB). All 7 Monday 20 July starters STILL 0 class assignments. Gustavo BC24967 STILL 0 SCAs. MONDAY IS TOMORROW.
BC1630 Saranzaya Khishigbayar / BC24616 Mia Wehrli / BC24686 Alberto Squillace / BC24942 Lorena Pizarro Araya / BC24966 Filippo Corazzini / BC24989 Marcos Abrego Tofe / BC25000 Giorgio Sau: all still 0 SCAs.
BC24967 Gustavo Da Silva: 12 days missed, 20 days remain, STILL 0 SCAs.
Holds unchanged: BC24932 Stephany PENDING bk18157; BC25001 Neil bk18224 PENDING total=null.
Fix NOT RUN as of 140th check.
Last checked: Saturday 18 July 2026 UTC (140th check, 7th today, hourly bot).

---
141st check Saturday 18 July 2026 UTC (8th today)

CONFIRMED UNCHANGED (fresh DB). All 7 Monday 20 July starters STILL 0 class assignments. Gustavo BC24967 STILL 0 SCAs. MONDAY IS TOMORROW. Fix NOT RUN.
Last checked: Saturday 18 July 2026 UTC (141st check, 8th today, hourly bot).

---
142nd check Saturday 18 July 2026 UTC (9th today) — EXPANDED FINDING

Original 7 Monday starters + Gustavo: all STILL 0 class assignments. UNCHANGED.

NEW FINDING: 9 additional July 13 starters with zero class assignments, NOT previously tracked in this issue.

TWO ENDED WITH ZERO ATTENDANCE (full week permanently missed):
  BC24946  Lunel Dubost             (student 14566)  General English AM   13-17 Jul 2026  booking 18171 CONFIRMED
  BC24994  Petru Ous                (student 14591)  General English AM   13-17 Jul 2026  booking 18217 CONFIRMED

SEVEN ACTIVE — week 1 missed, assign before Monday 20 July 09:00:
  BC24998  Allison Ayala Vazquez    (student 1911)   General English PM      Jul 13-31           booking 18221 CONFIRMED
  BC24988  Minjinsor Buyanbat       (student 14586)  Academic Year Morning   Jul 13-Jan 15 2027  booking 18211 CONFIRMED
  BC1788   Pedro Campion Teixeira   (student 1045)   Academic Year Afternoon Jul 13-Dec 18       booking 1603  CONFIRMED
  BC1814   Wanqiong Hou             (student 1068)   Academic Year Morning   Jul 13-Dec 18       booking 1628  CONFIRMED
  BC24990  Samuele Stenico          (student 14588)  General English AM      Jul 13-Aug 7        booking 18213 CONFIRMED
  BC24820  Italo Teixeira           (student 14530)  Academic Year Afternoon Jul 13-Dec 18       booking 18030 CONFIRMED
  BC1619   Munkhtsetseg Tserennadmid (student 922)   Academic Year Morning   Jul 13-Jan 1 2027   booking 1472  PARTIAL

Note: Edith Nunes (BC24991, issue 22) also Jul 13 starter with 0 class assignments on BC24991.
Note: Gustavo Da Silva (BC24967, started Jul 6): 13 days missed, 20 days remain.
Note: Luz Maria Sobrino Blanco (BC24992, Jul 13-17): booking 18215 PENDING — skip.

Additional fix steps — NOT YET RUN:

PRIORITY 3 — assign 7 additional Jul 13 starters (week 1 missed, course still running):
  Assign BC24998 Allison Ayala Vazquez   (General English PM)
  Assign BC24988 Minjinsor Buyanbat      (Academic Year Morning)
  Assign BC1788  Pedro Campion Teixeira  (Academic Year Afternoon)
  Assign BC1814  Wanqiong Hou            (Academic Year Morning)
  Assign BC24990 Samuele Stenico         (General English AM)
  Assign BC24820 Italo Teixeira          (Academic Year Afternoon)
  Assign BC1619  Munkhtsetseg Tserennadmid (Academic Year Morning — booking 1472 PARTIAL; confirm before assigning)

FOR ENDED COURSES (Dubost + Ous — attendance permanently lost for Jul 13-17):
  Set BC24946 and BC24994 active = false.
  Add a comment to bookings 18171 and 18217 noting attendance was not recorded.
  Confirm with Neil whether these students re-enrolled or require a refund.

Status: CRITICAL — classes begin Monday 20 July 2026. Fix NOT YET RUN.
Last checked: Saturday 18 July 2026 UTC (142nd check, 9th today, hourly bot).

---
143rd check 2026-07-18 SAT UTC (10th today)

CONFIRMED UNCHANGED (fresh DB). Original 7 Monday 20 Jul starters: all STILL 0 class assignments (BCs 1630, 24616, 24686, 24942, 24966, 24989, 25000). Gustavo Da Silva BC24967: STILL 0 SCAs (14 days missed). 7 Jul-13 actives: all STILL 0 SCAs (BCs 24998, 24988, 1788, 1814, 24990, 24820, 1619). BC24946 Lunel Dubost + BC24994 Petru Ous: both ended Jul17, still active=true (stale), 0 SCAs — full course permanently missed. Munkhtsetseg BC1619 booking 1472: PARTIAL, EUR200/EUR1943.50. Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (143rd check, 10th today, hourly bot).

---
147th check 2026-07-18 SAT UTC (14th today)

NEW FINDING: Booking course 25009 (Neil Mc Mahon, student 97, General English AM, 20-24 Jul 2026): found in fresh DB this run — not previously tracked. Booking PARTIAL EUR 0/192.50. Likely a staff or test entry. Do not assign automatically — confirm with Neil.

7 Monday 20 Jul starters: all STILL 0 class assignments (BCs 1630 Saranzaya, 24616 Mia fee=null, 24686 Alberto fee=null, 24942 Lorena, 24966 Filippo, 24989 Marcos, 25000 Giorgio). BC24967 Gustavo Da Silva: CONFIRMED EUR 1014.60 fully paid, STILL 0 SCAs, 14 days missed, 20 days remain. 7 Jul13 actives: all STILL 0 SCAs (BCs 1619 Munkhtsetseg PARTIAL bk1472 EUR200/1943.50, 1788 Pedro, 1814 Wanqiong, 24820 Italo, 24988 Minjinsor, 24990 Samuele, 24998 Allison). BCs 24946 Lunel + 24994 Petru: ended Jul17 active=STILL true (1d stale, full courses missed). BC24932 Stephany: PENDING bk18157 EUR0/997 — hold.

Fix NOT RUN. MONDAY IS TOMORROW.
Last checked: 2026-07-18 SAT UTC (147th check, 14th today, hourly bot).

---
148th check 2026-07-18 SAT UTC (15th today)

CONFIRMED UNCHANGED (fresh DB). Correction from earlier runs: Monday 20 July is 2 days away (today is Saturday; tomorrow is Sunday 19 Jul). Not "tomorrow".
Gustavo BC24967: 12 school days missed (weeks Jul 6-10 and Jul 13-17), not 14. Correction applied.
7 Monday 20 Jul starters: all STILL 0 class assignments (BCs 1630, 24616, 24686, 24942, 24966, 24989, 25000).
7 Jul 13 actives: all STILL 0 class assignments (BCs 1619, 1788, 1814, 24820, 24988, 24990, 24998).
BC25009 Neil Mc Mahon (student 97, General English AM, 20-24 Jul 2026, fee=EUR 190): PARTIAL booking EUR 0/192.50 — confirm with Neil before assigning; may be staff or test entry.
BC24946 Lunel Dubost + BC24994 Petru Ous: ended Jul 17, still active=true (1 day stale). Full 1-week courses permanently missed.
BC24932 Stephany Martins Pardinho: PENDING booking 18157 EUR 0/997 — hold, do not assign.
Fix NOT RUN. Classes begin Monday 20 July (2 days).
Last checked: 2026-07-18 SAT UTC (148th check, 15th today, hourly bot).

---
149th check 2026-07-18 SAT UTC (16th today)

CONFIRMED UNCHANGED (fresh DB). 7 Monday 20 Jul starters STILL 0 class assignments: BC1630 Saranzaya, BC24616 Mia (fee=null), BC24686 Alberto (fee=null), BC24942 Lorena, BC24966 Filippo, BC24989 Marcos, BC25000 Giorgio. Gustavo BC24967 (GE AM Jul6–Aug7): STILL 0 SCAs, 12 school days missed, 20 days remain. 7 Jul13 actives STILL 0: BC1619 Munkhtsetseg (PARTIAL bk1472 EUR200/1943.50), BC1788 Pedro, BC1814 Wanqiong, BC24820 Italo, BC24988 Minjinsor, BC24990 Samuele, BC24998 Allison. BC24946 Lunel Dubost + BC24994 Petru Ous: ended Jul17, active=STILL true (1d stale, full courses permanently missed). BC25009 Neil Mc Mahon (student 97, GE AM, Jul20–24, PARTIAL EUR0/192.50) — verify before assigning. BC24932 Stephany: PENDING bk18157 EUR0/997 — hold. Fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (149th check, 16th today, hourly bot).

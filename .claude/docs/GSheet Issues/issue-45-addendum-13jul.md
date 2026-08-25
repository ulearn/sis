Issue 45 Addendum — 13 July 2026 (renewal arrivals: Pietro, Kayque, Tuguldurtugs)

TODAY IS MON 13 JUL — all 3 students are in school with no class assignment.

42nd check 2026-07-13 MON UTC

CONFIRMED UNCHANGED (fresh DB). Zero valid class assignments for all 3 students.

Pietro Colombo (s72, bc81 Morning General Plus Jul6-Jul24, bk78 CONF EUR1880/1880):
STILL 0 SCAs ever. 6 school days missed Jul7-13. 9 school days remaining. Fix NOT RUN.

Kayque Tauann Lopes Coelho (s852, bc1821 AY Renewal Afternoon Jun29-Dec18, bk1633 CONF EUR1405.50/1405.50):
SCA26 weekEnd=Apr24 on old bc1507 (80d expired). STILL 0 valid SCAs for current bc1821. Fix NOT RUN.

Tuguldurtugs Enkhtugs (s858, bc1786 AY Renewal Morning Jul6-Dec25, bk1601 CONF EUR1356.50/1606.50 EUR250 open):
SCA55 weekEnd=May1 on old bc1521 (73d expired). STILL 0 valid SCAs for current bc1786. Fix NOT RUN.

FIX — NOT YET RUN — assign via SIS admin NOW:
1. Pietro (s72 bk78 bc81 ends Jul24): Add SCA weekStart=2026-07-13 weekEnd=2026-07-25
2. Kayque (s852 bk1633 bc1821 ends Dec18): Add SCA weekStart=2026-07-13 weekEnd=2026-12-19
3. Tuguldurtugs (s858 bk1601 bc1786 ends Dec25): Add SCA weekStart=2026-07-13 weekEnd=2026-12-26

RISK: Low. SCA inserts only. Fully reversible. Blast radius = 3 students.
Last checked: 2026-07-13 MON UTC (42nd check, hourly bot). Fix NOT RUN.

---

43rd check 2026-07-13 MON UTC (second run today)

NEW STUDENT FOUND: Sophia Emilly Gallo Borim (student 853, booking course 1820, Academic Year Renewal Afternoon, 29 June to 18 December 2026). Named in G column ("Sophia and Kayque, who started last week"). Last SCA=week end 24 April 2026 (old course, 80 days expired). 0 valid class assignments on current bc1820 (14 days in since 29 June). NOT included in morning run fix recipe.

FULL LIST - 4 students needing SCA TODAY (NOT YET RUN):
1. Pietro Colombo (s72, bc81 Morning General Plus Jul6-Jul24): ADD SCA weekStart=2026-07-13 weekEnd=2026-07-25
2. Sophia Emilly Gallo Borim (s853, bc1820 AY Renewal Afternoon Jun29-Dec18): ADD SCA weekStart=2026-07-13 weekEnd=2026-12-19
3. Kayque Tauann Lopes Coelho (s852, bc1821 AY Renewal Afternoon Jun29-Dec18): ADD SCA weekStart=2026-07-13 weekEnd=2026-12-19
4. Tuguldurtugs Enkhtugs (s858, bc1786 AY Renewal Morning Jul6-Dec25): ADD SCA weekStart=2026-07-13 weekEnd=2026-12-26

NOTE: Sophia (bc1820) and Kayque (bc1821) same course type, different booking course records. Each needs SCA on its own bc_id.

RISK: Low. SCA inserts only. Reversible. Blast radius: 4 students. Fix NOT RUN.
Last checked: 2026-07-13 MON UTC (43rd check, second run).
---
44th check 2026-07-13 MON UTC (3rd run today)

CONFIRMED UNCHANGED (fresh DB). No class assignments added.

Pietro (s72, bc81 Morning General Plus Jul6-Jul24): 0 SCAs ever. 7 school days missed. 9 school days remaining in course — MOST URGENT.
Sophia (s853, bc1820 AY Renewal Afternoon Jun29-Dec18): last SCA on old bc1509 weekEnd=Apr24. 0 SCAs on current bc1820.
Kayque (s852, bc1821 AY Renewal Afternoon Jun29-Dec18): last SCA on old bc1507 weekEnd=Apr24. 0 SCAs on current bc1821.
Tuguldurtugs (s858, bc1786 AY Renewal Morning Jul6-Dec25): last SCA on old bc1521 weekEnd=May1. 0 SCAs on current bc1786.

Fix NOT RUN. Assign via SIS admin for all 4 students using weekStart=2026-07-13.
Last checked: 2026-07-13 MON UTC (44th check). Fix NOT RUN.

---

45th check 2026-07-13 MON UTC (4th run today)

CONFIRMED UNCHANGED. No class assignments added.

NEW FINDING — STALE OLD BOOKING COURSES (not previously documented):
Sophia (s853), Kayque (s852), and Tuguldurtugs (s858) each have 2 old booking courses that ended months ago but are still active=true:
  Sophia:       BC1508 (AY Morning Oct 2025 - Dec 2025, ended 19 Dec 2025, 206d stale)
                BC1509 (AY Morning Jan 2026 - Apr 2026, ended 24 Apr 2026, 80d stale)
  Kayque:       BC1506 (AY Morning Oct 2025 - Dec 2025, ended 19 Dec 2025, 206d stale)
                BC1507 (AY Morning Jan 2026 - Apr 2026, ended 24 Apr 2026, 80d stale)
  Tuguldurtugs: BC1520 (AY Morning Oct 2025 - Dec 2025, ended 19 Dec 2025, 206d stale)
                BC1521 (AY Morning Jan 2026 - May 2026, ended 1 May 2026, 73d stale)

These 6 stale BCs should be deactivated (set active=false) as data hygiene - NOT YET RUN.

FULL FIX LIST - NOT YET RUN:

PART A - Class assignments (create via SIS admin):
1. Pietro Colombo (s72, bk78, bc81 Morning General Plus, Jul6-Jul24): ADD SCA weekStart=2026-07-13 weekEnd=2026-07-25
2. Sophia Emilly Gallo Borim (s853, bc1820 AY Renewal Afternoon Jun29-Dec18): ADD SCA weekStart=2026-07-13 weekEnd=2026-12-19
3. Kayque Tauann Lopes Coelho (s852, bc1821 AY Renewal Afternoon Jun29-Dec18): ADD SCA weekStart=2026-07-13 weekEnd=2026-12-19
4. Tuguldurtugs Enkhtugs (s858, bc1786 AY Renewal Morning Jul6-Dec25): ADD SCA weekStart=2026-07-13 weekEnd=2026-12-26

PART B - Deactivate stale old booking courses (DB UPDATE - NOT YET RUN):
  UPDATE booking_course SET active=false WHERE id IN (1506, 1507, 1508, 1509, 1520, 1521);
  (All 6 ended Dec 2025 or Apr-May 2026; none are needed going forward.)

RISK: Part A = low, SCA inserts only, reversible. Part B = low, data hygiene, reversible.
Blast radius: 4 students (SCAs), 6 stale booking course records (deactivation).
Last checked: 2026-07-13 MON UTC (45th check). Fix NOT RUN.

---
46th check 2026-07-13 MON UTC

CONFIRMED UNCHANGED (fresh DB). No action taken.

Pietro Colombo (s72, bc81 Morning General Plus Jul6-Jul24): 0 SCAs ever. 9 school days remaining. MOST URGENT.
Sophia (s853, bc1820), Kayque (s852, bc1821), Tuguldurtugs (s858, bc1786): 0 valid SCAs on current courses.
6 stale old BCs (1506, 1507, 1508, 1509, 1520, 1521): all still active=true. Fix NOT RUN.

---
47th check 2026-07-13 MON UTC (this run)

CONFIRMED UNCHANGED (fresh DB). No action taken.

Same state as 46th check. Pietro BC81 ends Jul24 — 9 school days remaining incl today. All 4 students invisible to class scheduling.
6 stale old BCs still active. Fix NOT RUN.

NEIL: assign class for all 4 students and deactivate 6 stale BCs — see FULL FIX LIST from 45th check above.
Last checked: 2026-07-13 MON UTC (47th check, hourly bot).

---
48th check 2026-07-13 UTC. CONFIRMED UNCHANGED (fresh DB). No action taken.

All 4 students still 0 class assignments. Pietro (s72, bc81 Morning General Plus Jul6-Jul24): STILL 0 SCAs ever. 9 school days remaining (14-24 Jul Thu, excl weekends). MOST URGENT.
Sophia (s853, bc1820), Kayque (s852, bc1821), Tuguldurtugs (s858, bc1786): 0 valid SCAs on current courses.
6 stale old BCs (1506, 1507, 1508, 1509, 1520, 1521): all still active=true.

NEIL: assign class for all 4 students and deactivate 6 stale BCs — see FULL FIX LIST from 45th check above.
Last checked: 2026-07-13 UTC (48th check, hourly bot). Fix NOT RUN.

---
49th check 2026-07-13 UTC. CONFIRMED UNCHANGED (fresh DB).

Pietro Colombo (s72, bc81 Morning General Plus Jul6-Jul24): STILL 0 SCAs ever. 8 school days remaining (Jul14-24 Thu). MOST URGENT.
Sophia Emilly Gallo Borim (s853, bc1820 AY Renewal Aft Jun29-Dec18): 0 valid SCAs on current bc1820.
Tuguldurtugs Enkhtugs (s858, bc1786 AY Renewal Morn Jul6-Dec25): 0 valid SCAs on current bc1786.
Kayque Tauann Lopes Coelho (s852, bc1821 AY Renewal Aft Jun29-Dec18): 0 valid SCAs on current bc1821.
6 stale old BCs (1506/1507/1508/1509/1520/1521) still active=true.

Fix NOT RUN. NEIL: assign all 4 students via SIS Classes > To Be Assigned. Pietro deadline = Jul24.
Last checked: 2026-07-13 MON UTC (49th check, hourly bot).

---
50th check 2026-07-13 MON UTC

CONFIRMED UNCHANGED (fresh DB). No action taken.

Pietro Colombo (s72, bc81 Morning General Plus Jul6-Jul24): STILL 0 SCAs ever. 9 school days remaining (Jul14-24). MOST URGENT — course ends Jul24.
Sophia Emilly Gallo Borim (s853, bc1820 AY Renewal Aft Jun29-Dec18): STILL 0 valid SCAs on current bc1820. 14 days in school untracked.
Kayque Tauann Lopes Coelho (s852, bc1821 AY Renewal Aft Jun29-Dec18): STILL 0 valid SCAs on current bc1821. 14 days in school untracked.
Tuguldurtugs Enkhtugs (s858, bc1786 AY Renewal Morn Jul6-Dec25): STILL 0 valid SCAs on current bc1786. 8 days in school untracked.
6 stale old BCs (1506/1507/1508/1509/1520/1521) still active=true.

Fix NOT RUN. NEIL: assign via SIS Classes > To Be Assigned for all 4 students. Pietro deadline = Jul24.
Last checked: 2026-07-13 MON UTC (50th check, hourly bot). Fix NOT RUN.

---
51st check 2026-07-13 MON UTC — EXPANDED: 11 students with zero class assignments

NEW STUDENTS found starting this week (Jul 13), all CONFIRMED, all 0 SCAs:
5. Munkhtsetseg Tserennadmid (s922, bk1472, BC1619 AY Morning Jul13-Jan1 2027): ADD SCA ws=2026-07-13 we=2027-01-02
6. Pedro Campion Teixeira (s1045, bk1603, BC1788 AY Afternoon Jul13-Dec18): ADD SCA ws=2026-07-13 we=2026-12-19
7. Wanqiong Hou (s1068, bk1628, BC1814 AY Morning Jul13-Dec18): ADD SCA ws=2026-07-13 we=2026-12-19
8. Italo Teixeira (s14530, bk18030, BC24820 AY Afternoon Jul13-Dec18): ADD SCA ws=2026-07-13 we=2026-12-19
9. Lunel Dubost (s14566, bk18171, BC24946 GE-AM Jul13-Jul17): ADD SCA ws=2026-07-13 we=2026-07-18 — ENDS FRIDAY, most urgent
10. Samuele Stenico (s14588, bk18213, BC24990 GE-AM Jul13-Aug7): ADD SCA ws=2026-07-13 we=2026-08-08
11. Edith Nunes (s1015, bk18214, BC24991 GE-AM Jul13-Aug7): ADD SCA ws=2026-07-13 we=2026-08-08

NOTE: Edith Nunes BC24991 is a new booking (bk18214) distinct from old bk18158 (stale BCs 24933/24934 — see issue 22 for that cleanup).

RISK: Low. SCA inserts only. Reversible. Blast radius: 11 students.
Last checked: 2026-07-13 MON UTC (51st check, hourly bot). Fix NOT RUN.
---
52nd check 2026-07-13 MON UTC

CONFIRMED UNCHANGED (fresh DB). All 11 students still zero class assignments.

MOST URGENT — Lunel Dubost (s14566, bk18171, BC24946 GE-AM Jul13-17): course ends FRIDAY 17 JULY — 4 school days remaining, never had a class assigned. Must assign TODAY.

Pietro Colombo (s72, bc81 Morning General Plus Jul6-Jul24): 0 SCAs ever. Day 8 of course, 9 school days left. Second most urgent.

All 7 Jul13 starters (Munkhtsetseg BC1619, Pedro BC1788, Wanqiong BC1814, Italo BC24820, Lunel BC24946, Samuele BC24990, Edith BC24991): completed Day 1 with zero class assignments.

AY renewals (Sophia BC1820, Kayque BC1821, Tuguldurtugs BC1786): still 0 valid SCAs on current courses, 14+ days untracked.

Fix NOT RUN. NEIL: assign Lunel (BC24946) FIRST — ends Friday. Then Pietro, then AY students.
Last checked: 2026-07-13 MON UTC (52nd check, hourly bot). Fix NOT RUN.

---
55th check 2026-07-13 Mon UTC

CONFIRMED UNCHANGED (fresh DB). No class assignments added.

Today is MONDAY 13 JULY — first school day for the 7 new starters. All 11 students have missed at least the morning class period.

Lunel Dubost (s14566, bk18171, BC24946 GE-AM Jul13-17): STILL 0 SCAs — first school day missed. Course ends FRIDAY 17 July. 4 school days remaining (Tue 14, Wed 15, Thu 16, Fri 17). MOST URGENT — must assign today.

Pietro Colombo (s72, bc81 Morning General Plus Jul6-Jul24): STILL 0 SCAs. Day 8 of course, 9 school days left (Jul14-Jul24). Second most urgent.

7 new Jul13 starters all missed Monday AM (no SCAs):
  Munkhtsetseg Tserennadmid (s922, BC1619 AY Morn Jul13-Jan27)
  Pedro Campion Teixeira (s1045, BC1788 AY Aft Jul13-Dec18)
  Wanqiong Hou (s1068, BC1814 AY Morn Jul13-Dec18)
  Italo Teixeira (s14530, BC24820 AY Aft Jul13-Dec18)
  Samuele Stenico (s14588, BC24990 GE-AM Jul13-Aug7)
  Edith Nunes (s1015, BC24991 GE-AM Jul13-Aug7)

AY renewals still 0 SCAs on current courses:
  Sophia Borim (s853, BC1820 AY Aft Jun29-Dec18): 14+ days untracked
  Kayque Coelho (s852, BC1821 AY Aft Jun29-Dec18): 14+ days untracked
  Tuguldurtugs (s858, BC1786 AY Morn Jul6-Dec25): 8 days untracked

6 stale old BCs (1506/1507/1508/1509/1520/1521) still active=true.

Fix NOT RUN. NEIL: assign all 11 via SIS Classes > To Be Assigned. Lunel FIRST (ends Friday).
Last checked: 2026-07-13 Mon UTC (55th check, hourly bot).

---
56th check 2026-07-13 Mon UTC

CONFIRMED UNCHANGED (fresh DB). All 11 BCs still 0 class assignments.

MOST URGENT: Lunel Dubost (s14566, bk18171, BC24946 GE-AM Jul13-17): 0 SCAs, Day 1 today, 4 school days remaining (Tue 14, Wed 15, Thu 16, Fri 17). Course ends FRIDAY. Assign NOW.
Pietro Colombo (s72, bc81 Morning General Plus Jul6-Jul24): 0 SCAs ever. Day 9, 9 school days remaining (Jul 14-24).
Sophia (s853, bc1820), Kayque (s852, bc1821): 0 SCAs on current courses, 14 school days missed.
Tuguldurtugs (s858, bc1786): 0 SCAs on current bc, 8 school days missed.
6 Jul13 starters (Munkhtsetseg BC1619, Pedro BC1788, Wanqiong BC1814, Italo BC24820, Samuele BC24990, Edith BC24991): all Day 1, 0 SCAs.
Note: Munkhtsetseg booking 1472 = PARTIAL (payment outstanding) — may block class assignment.
6 stale old BCs (1506/1507/1508/1509/1520/1521) still active=true.

Fix NOT RUN. NEIL: assign all 11 via SIS Classes > To Be Assigned. Lunel FIRST.
Last checked: 2026-07-13 Mon UTC (56th check, hourly bot).

---
57th check 2026-07-13 Mon UTC

CONFIRMED UNCHANGED (fresh DB). All 11 booking courses still 0 class assignments.
Lunel Dubost (s14566, BC24946 GE-AM Jul13-Jul17): 0 SCAs, Day 1 passed, 4 school days remain. MOST URGENT - ends Friday.
Pietro Colombo (s72, BC81 Jul6-Jul24): 0 SCAs, Day 6, 9 school days remain (Jul14-24).
Sophia Borim (s853, BC1820 AY Aft Jun29-Dec18): 0 SCAs, 11 school days missed.
Kayque Coelho (s852, BC1821 AY Aft Jun29-Dec18): 0 SCAs, 11 school days missed.
Tuguldurtugs (s858, BC1786 AY Morn Jul6-Dec25): 0 SCAs, 6 school days missed.
6 Jul13 starters Day 1 all 0 SCAs: Munkhtsetseg BC1619 (bk PARTIAL), Pedro BC1788, Wanqiong BC1814, Italo BC24820, Samuele BC24990, Edith BC24991.
6 stale old BCs (1506/1507/1508/1509/1520/1521) still active=true.
Fix NOT RUN. NEIL: assign all 11 via SIS Classes > To Be Assigned. Lunel FIRST - ends Friday 17 Jul.
Last checked: 2026-07-13 Mon UTC (57th check).


---
58th check 2026-07-14 Tue UTC

SCOPE ESCALATION: Fresh DB query (active BCs, started Jun14-Jul14) finds 51 courses with 0 class assignments. Prior H said '11' — only named students were tracked. Actual scope is much larger.

4 courses ending this FRIDAY 17 July — assign TODAY:
1. Lunel Dubost (s14566, BC24946, GE AM Jul13-17): Day 2, 3 days left
2. Florian Baury (s81, BC95, MG Plus Jun29-Jul17): 12 school days missed, ends Fri
3. Silvia Maza Valladolid (s14583, BC24985, GE PM Jul6-17): 7 days missed, ends Fri
4. Gladis Maza Valladolid (s14584, BC24986, GE PM Jul6-17): 7 days missed, ends Fri

Long-running renewals (also 0 SCAs):
- Pietro Colombo (s72, BC81, MG Plus Jul6-24): 9 school days missed
- Sophia Emilly Gallo Borim (s853, BC1820, AY Renewal PM Jun29-Dec18): 12 days
- Kayque Tauann Lopes Coelho (s852, BC1821, AY Renewal PM Jun29-Dec18): 12 days
- Tuguldurtugs Enkhtugs (s858, BC1786, AY Renewal Morn Jul6-Dec25): 7 days
- Telmuun Enkhsaikhan (s293, BC1810, AY Renewal Morn Jun29-Dec18): 12 days
- Gantogtokh Bayarjargal (s1016, BC1752, AY Morn Jun22-Dec11): 17 days
- Bayanzul Bayanmunkh (s989, BC1716, AY Morn Jun22-Dec11): 17 days
- Ziyi Zhang (s1064, BC1809, AY PM Jun22-Dec11): 17 days
- Roosevelt Rodrigues de Freitas Lima (s1070, BC1817, AY PM Jun22-Dec11): 17 days
- Bilal Dehiri (s1029, BC1767, AY Morn Jun15-Dec4): 29 days missed
- Bruno Freire Pereira Evandro (s809, BC1418, AY PM Jun15-Dec4): 29 days missed

Fix NOT RUN. NEIL: assign class via SIS > Classes > To Be Assigned — start with 4 courses ending Fri Jul17.
Last checked: 2026-07-14 Tue UTC (58th check, hourly bot).
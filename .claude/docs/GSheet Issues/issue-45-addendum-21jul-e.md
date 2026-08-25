Issue 45 -- Renewal students unassigned -- Addendum 21 Jul 2026 (26th hrly)

Reporter: AC | Area: Renewal students | Sheet row: 47

Root cause (55th check, Tue 21 Jul 2026 UTC):

EXPANDED SWEEP: 18 students with confirmed booking courses starting 1-25 Jul 2026
have zero class assignments. Previous checks tracked only 4 students.

Active courses with zero SCAs:
  Eduardo Roche Diaz (student 14602, BK18233, BC25011 General English PM, 20-24 Jul)
    COURSE ENDS FRIDAY 24 JUL - 3 school days left (Wed 22, Thu 23, Fri 24)
  Sarah Venturini Talizin (student 1055, BK18169, BC24945 GE AM, 6-31 Jul)
    15 school days missed; 8 remaining (22-24 Jul + 27-31 Jul)
  Mohammed Ibrahimi Alsaidalani (student 14552, BC24920 GE AM, 6 Jul-9 Oct)
    long course; 15 school days missed
  Yuxi Ke (BC24965 GE PM, 6 Jul-21 Aug) -- 15 days missed
  Gustavo Da Silva (BC24967 GE AM + BC24955 GE AM Plus, 6 Jul-7 Aug)
    two concurrent BCs; 15 days missed
  Allison Guadalupe Ayala Vazquez (student 1911, BK18221, BC24998 GE PM, 13-31 Jul)
    7 school days missed
  Wanqiong Hou (BC1814 Academic Year Morning, 13 Jul-18 Dec) -- 7 days missed
  Pedro Campion Teixeira (BC1788 Academic Year Afternoon, 13 Jul-18 Dec) -- 7 days missed
  Xuezhen Huang (student 14443, BK17831, BC24609 Morning General, 13-31 Jul) -- 7 days missed
  Italo Teixeira (BC24820 Academic Year Afternoon, 13 Jul-18 Dec) -- 7 days missed
  Samuele Stenico (student 14588, BK18213, BC24990 GE AM, 13 Jul-7 Aug) -- 7 days missed
  Minjinsor Buyanbat (BC24988 Academic Year Morning, 13 Jul-15 Jan 2027) -- 7 days missed
  Lorena Fernanda Pizarro Araya (BC24942 AY Morning, 20 Jul-22 Jan 2027) -- 2 days missed
  Saranzaya Khishigbayar (BC1630 AY Afternoon, 20 Jul-8 Jan 2027) -- 2 days missed

Already ended with zero SCAs (no action possible):
  Veronica Martin (BC24931 GE AM, 6-10 Jul) -- ended 11 days ago
  Lunel Dubost (BC24946 GE AM, 13-17 Jul) -- ended 4 days ago
  Petru Ous (BC24994 GE AM, 13-17 Jul) -- ended 4 days ago

Fix recipe (NOT YET RUN):
1. TODAY URGENT: Assign Eduardo Roche Diaz to GE PM class:
   SIS > Student 14602 > Booking 18233 > BC25011 > Assign Class

2. Assign all active students in priority order (days-missed, highest first):
   Sarah Venturini Talizin: Student 1055 > BK18169 > BC24945 > Assign Class (GE AM)
   Mohammed Ibrahimi: Student 14552 > BC24920 > Assign Class (GE AM)
   Yuxi Ke: BC24965 > Assign Class (GE PM)
   Gustavo Da Silva: BC24967 and BC24955 > Assign Class
   Allison Ayala Vazquez: Student 1911 > BK18221 > BC24998 > Assign Class (GE PM)
   Wanqiong Hou: BC1814 > Assign Class (AY Morning)
   Pedro Campion Teixeira: BC1788 > Assign Class (AY Afternoon)
   Xuezhen Huang: Student 14443 > BK17831 > BC24609 > Assign Class (Morning General)
   Italo Teixeira: BC24820 > Assign Class (AY Afternoon)
   Samuele Stenico: Student 14588 > BK18213 > BC24990 > Assign Class (GE AM)
   Minjinsor Buyanbat: BC24988 > Assign Class (AY Morning)
   Lorena Pizarro Araya: BC24942 > Assign Class (AY Morning)
   Saranzaya Khishigbayar: BC1630 > Assign Class (AY Afternoon)

3. Veronica Martin, Lunel Dubost, Petru Ous courses already ended.
   Confirm with staff if retrospective attendance records are needed.

Risk: class assignments. Each is UI-reversible.
CRITICAL -- Eduardo ends Friday 24 Jul. Action today.
Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (26th hourly)

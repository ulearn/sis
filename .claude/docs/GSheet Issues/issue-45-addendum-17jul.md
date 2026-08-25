Issue 45 Addendum — 17 Jul 2026 (Friday)

Sheet row: 47 | Reporter: AC | Area: Renewal students | Check: 114th

---

Symptom: Returning students not appearing on arrivals list.

Root cause — fresh DB 17 Jul 2026

8 courses ending TODAY (17 Jul) with zero class assignments:

BC1719  Maria Magdalena Hermosilla Ogaz (s992, bk1543): AY Afternoon 26 Jan-17 Jul — ZERO SCAs for ENTIRE 24-week course; attendance never tracked.
BC26    Kritchana RATCHA-ANAN (bk25): AY Morning 26 Jan-17 Jul — 0 SCAs. bk25 PENDING: amountPaid=null, amountOpen=EUR 2638.75, confirmed=false.
BC95    Florian Baury (bk87): Morning General Plus 29 Jun-17 Jul — 0 SCAs. NEW this check.
BC24946 Lunel Dubost (bk18171): General English AM 13-17 Jul — 0 SCAs.
BC24985 Silvia Cecilia Maza Valladolid (bk18208): General English PM 6-17 Jul — 0 SCAs. PENDING EUR 265 unpaid.
BC24986 Gladis Patricia Maza Valladolid (bk18209): General English PM 6-17 Jul — 0 SCAs. PENDING EUR 265 unpaid.
BC24992 Luz Maria Sobrino Blanco (bk18215): General English AM 13-17 Jul — 0 SCAs. NEW this check.
BC24994 Petru Ous (bk18217): General English AM 13-17 Jul — 0 SCAs.

9 courses starting Monday 20 Jul with zero SCAs:
BC1630  Saranzaya Khishigbayar — fee EUR 2620
BC24616 Mia Wehrli — fee NULL (new finding)
BC24686 Alberto Squillace — fee NULL (also Issue 24)
BC24942 Lorena Fernanda Pizarro Araya — fee EUR 2362.50
BC24932 Stephany Martins Pardinho — fee EUR 3150 (NEW this check)
BC24966 Filippo Corazzini — fee EUR 549.90
BC24989 Marcos Abrego Tofe — fee EUR 152
BC25000 Giorgio Sau — fee EUR 940
BC25001 Neil Mc Mahon — fee EUR 360 (admin/test?)

---

Fix recipe — NOT YET RUN

1. Assign 9 Monday starters before 20 Jul:
   Via SIS admin → each student → booking course → class assignment.
   Set fee on BC24616 (Mia): check HubSpot deal, then:
   UPDATE "BookingCourse" SET fee = <amount> WHERE id = 24616;
   Set fee on BC24686 (Alberto): see Issue 24 recipe.
   Verify BC25001 (Neil) is test booking before assigning.

2. Today (17 Jul) ending courses — decide with Neil:
   BC1719 Maria Magdalena: 24 weeks never assigned — back-fill or note in booking?
   Back-fill if approved:
   INSERT INTO "StudentClassAssignment" (student_id, booking_course_id, class_id, week_start, week_end)
   VALUES (992, 1719, <class_id_from_Neil>, '2026-01-26', '2026-07-17');
   BC24985/24986 Maza sisters: resolve bk18208+bk18209 PENDING EUR 265 each first.
   BC26 Kritchana: bk25 PENDING EUR 2638.75 fully unpaid — payment chase or cancel.
   BC95, BC24946, BC24992, BC24994: verify attending today before assigning.

Risk: bookings/attendance | BC1719 24-week attendance gap | BC24616 fee null causes wrong invoice |
      Unpaid pending bookings need finance decision | All changes reversible | 17 student records

Status: Open — NOT YET RUN
Last checked: Friday 17 July 2026 UTC (114th check)

---

118th check Friday 17 July 2026 UTC

All 9 Monday 20 July starters confirmed 0 class assignments (fresh database).

BC24932 Stephany Martins Pardinho (s14560, bk18157): Life Pass Morning Jul 20 2026 to Aug 22 2028 = 105 weeks; booking PENDING.
Do not assign until booking 18157 is CONFIRMED and paid.

BC25001 Neil Mc Mahon (s97, bk18224): General English AM Jul 20 to Aug 1; booking PENDING.
Appears to be admin/test record — verify before assigning.

7 confirmed starters needing assignment before Mon 20 Jul (NOT YET RUN):
  BC1630  Saranzaya Khishigbayar (s931) AY Afternoon Jul20-Jan8 2027 bk1481 CONF EUR 2620
  BC24616 Mia Wehrli (s14450) Gen English AM Plus Jul20-31 bk17842 CONF fee null (check HubSpot)
  BC24686 Alberto Squillace (s1052) Morning General Jul20-Sep18 bk1611 CONF fee null (Issue 24)
  BC24942 Lorena Pizarro Araya (s14565) AY Morning Jul20-Jan22 2027 bk18166 CONF EUR 2362.50
  BC24966 Filippo Corazzini (s14578) Gen English AM Plus Jul20-Aug7 bk18190 CONF EUR 549.90
  BC24989 Marcos Abrego Tofe (s14587) Gen English AM Jul20-24 bk18212 CONF EUR 152
  BC25000 Giorgio Sau (s14595) Gen English AM Plus Jul20-Aug21 bk18223 CONF EUR 940

Fix NOT RUN. Last checked: Friday 17 July 2026 UTC (118th check).

---
**119th check Friday 17 July 2026 UTC**

All 9 Monday 20 July starters confirmed STILL 0 class assignments (fresh DB query returned empty array).

BC24932 Stephany Martins Pardinho: PENDING (105-week Life Pass Jul 2026-Aug 2028) — hold, do not assign until confirmed.
BC25001 Neil Mc Mahon: PENDING (booking 18224) — likely admin/test record.
7 confirmed starters still need class assignment before Monday 20 July. WEEKEND — last business day today. Fix NOT RUN.

---
**121st check Friday 17 July 2026 UTC**

All 7 Monday 20 July starters CONFIRMED UNCHANGED (fresh DB).

BC1630  Saranzaya Khishigbayar  AY Afternoon  Jul20-Jan8 2027  bk1481  fee=EUR 2620   SCAs=0
BC24616 Mia Wehrli              GE AM Plus    Jul20-31         bk17842 fee=null       SCAs=0
BC24686 Alberto Squillace       Morning Gen   Jul20-Sep18      bk1611  fee=null       SCAs=0
BC24942 Lorena Pizarro Araya    AY Morning    Jul20-Jan22 2027 bk18166 fee=EUR 2362.50 SCAs=0
BC24966 Filippo Corazzini       GE AM Plus    Jul20-Aug7       bk18190 fee=EUR 549.90 SCAs=0
BC24989 Marcos Abrego Tofe      GE AM         Jul20-24         bk18212 fee=EUR 152    SCAs=0
BC25000 Giorgio Sau             GE AM Plus    Jul20-Aug21      bk18223 fee=EUR 940    SCAs=0

BC24932 Stephany Martins Pardinho (Life Pass Morning, 105 weeks, PENDING booking 18157) — do NOT assign until confirmed.
BC25001 Neil McMahon (GE AM Jul20-Aug1, PENDING booking 18224) — likely test/admin, verify before assigning.

8 courses ended 17 July 2026 with zero class assignments (all active=true):
BC1719  Maria Hermosilla Ogaz   AY Afternoon  Jan26-Jul17  fee=EUR 2620  24 weeks never attended
BC26    Kritchana RATCHA-ANAN   AY Morning    Jan26-Jul17  fee=EUR 3370  PENDING booking bk25 (unpaid)
BC95    Florian Baury           Morning GE+   Jun29-Jul17  fee=EUR 685   0 SCAs
BC24946 Lunel Dubost            GE AM         Jul13-17     fee=EUR 148.20
BC24985 Silvia Maza Valladolid  GE PM         Jul6-17      fee=EUR 240
BC24986 Gladis Maza Valladolid  GE PM         Jul6-17      fee=EUR 240
BC24992 Luz Sobrino Blanco      GE AM         Jul13-17     fee=EUR 152
BC24994 Petru Ous               GE AM         Jul13-17     fee=EUR 152

Fix NOT RUN. WEEKEND — last chance to assign 7 Monday starters before class Monday 20 July.
Last checked: 2026-07-17 FRI UTC (121st check, hourly bot).

---
**123rd check Friday 17 July 2026 UTC**

All 7 Monday 20 July starters CONFIRMED UNCHANGED (fresh DB).

BC1630  Saranzaya Khishigbayar  AY Afternoon  Jul20-Jan8 2027  bk1481  fee=EUR 2620   SCAs=0
BC24616 Mia Wehrli              GE AM Plus    Jul20-31         bk17842 fee=null       SCAs=0
BC24686 Alberto Squillace       Morning Gen   Jul20-Sep18      bk1611  fee=null       SCAs=0
BC24942 Lorena Pizarro Araya    AY Morning    Jul20-Jan22 2027 bk18166 fee=EUR 2362.50 SCAs=0
BC24966 Filippo Corazzini       GE AM Plus    Jul20-Aug7       bk18190 fee=EUR 549.90 SCAs=0
BC24989 Marcos Abrego Tofe      GE AM         Jul20-24         bk18212 fee=EUR 152    SCAs=0
BC25000 Giorgio Sau             GE AM Plus    Jul20-Aug21      bk18223 fee=EUR 940    SCAs=0

BC24932 Stephany Martins Pardinho (Life Pass Morning, 105 weeks, PENDING booking 18157) — do NOT assign until confirmed.
BC25001 Neil McMahon (GE AM Jul20-Aug1, PENDING booking 18224) — likely test/admin, verify before assigning.

WEEKEND — this is the last check before Monday 20 July. Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (123rd check, hourly bot).

---
**124th check Friday 17 July 2026 UTC**

BC25001 Neil Mc Mahon CONFIRMED = student 97 (Neil Mc Mahon), booking 18224 PENDING (confirmed=false, amountTotal=null, amountPaid=null). This is an admin/test record. Do NOT assign to a class.

All 7 real Monday starters STILL 0 class assignments (fresh DB). Unchanged from 123rd check. WEEKEND — last window before Monday 20 July.

Mia Wehrli (BC24616): booking 17842 is CONFIRMED, EUR 1149.90 fully paid; fee on BC24616 is still null — set fee before assigning.

Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (124th check, hourly bot).


---
**125th check Friday 17 July 2026 UTC**

All 7 Monday 20 July starters CONFIRMED STILL 0 class assignments (fresh DB).

BC1630  Saranzaya Khishigbayar  AY Afternoon  Jul20-Jan8 2027  bk1481  fee=EUR 2620   SCAs=0
BC24616 Mia Wehrli              GE AM Plus    Jul20-31         bk17842 fee=null       SCAs=0
BC24686 Alberto Squillace       Morning Gen   Jul20-Sep18      bk1611  fee=null       SCAs=0
BC24942 Lorena Pizarro Araya    AY Morning    Jul20-Jan22 2027 bk18166 fee=EUR 2362.50 SCAs=0
BC24966 Filippo Corazzini       GE AM Plus    Jul20-Aug7       bk18190 fee=EUR 549.90 SCAs=0
BC24989 Marcos Abrego Tofe      GE AM         Jul20-24         bk18212 fee=EUR 152    SCAs=0
BC25000 Giorgio Sau             GE AM Plus    Jul20-Aug21      bk18223 fee=EUR 940    SCAs=0

BC24932 Stephany Martins Pardinho (Life Pass Morning, 105 weeks, PENDING booking 18157) — do NOT assign until confirmed.
BC25001 Neil McMahon (GE AM Jul20-Aug1, PENDING booking 18224, admin/test record) — skip.

NEW ANOMALY: BC24832 (Marcos André de Souza Santos, student 14536, Academic Year Afternoon):
  start_date = 2026-05-31, end_date = 2026-05-31 — zero-day booking course (start = end)
  SCAs = 0, active = true
  Booking 18040: CONFIRMED, confirmed=true, amount_paid=EUR 2473, amount_total=EUR 2473 (fully paid)
  This is a data anomaly — a booking course created with identical start and end date.
  Neil: investigate BC24832 — determine if the course should be deactivated or corrected.

Fix NOT RUN. WEEKEND — last chance to assign 7 Monday starters before class Monday 20 July.
Last checked: 2026-07-17 FRI UTC (125th check, hourly bot).
---
**126th check Friday 17 July 2026 UTC**

7 confirmed Monday starters STILL 0 class assignments (fresh DB — unchanged from 125th check).

BC1630  Saranzaya Khishigbayar  AY Afternoon  Jul20-Jan8 2027  bk1481  fee=EUR 2620   SCAs=0
BC24616 Mia Wehrli              GE AM Plus    Jul20-31         bk17842 fee=null       SCAs=0
BC24686 Alberto Squillace       Morning Gen   Jul20-Sep18      bk1611  fee=null       SCAs=0
BC24942 Lorena Pizarro Araya    AY Morning    Jul20-Jan22 2027 bk18166 fee=EUR 2362.50 SCAs=0
BC24966 Filippo Corazzini       GE AM Plus    Jul20-Aug7       bk18190 fee=EUR 549.90 SCAs=0
BC24989 Marcos Abrego Tofe      GE AM         Jul20-24         bk18212 fee=EUR 152    SCAs=0
BC25000 Giorgio Sau             GE AM Plus    Jul20-Aug21      bk18223 fee=EUR 940    SCAs=0

NEW FINDINGS this check:

BC24967 (Gustavo Da Silva): started 6 July 2026, ends 7 August 2026 — 11 days into course.
  Status: CONFIRMED, paid EUR 1014.60, fee=EUR 137.60. Class assignments: ZERO.
  Action: assign to a class urgently (3 weeks of course remain).

BC24968 (Ettore Iovinella): started 6 July 2026, ENDED 10 July 2026 — 1-week course.
  Status: CONFIRMED, paid EUR 190.63, fee=EUR 183.30. Class assignments: ZERO.
  Entire course ended with no class assignment. Attendance Jul6-10 permanently unrecoverable.

BC24832 anomaly: Marcos Andre de Souza Santos, start=end=May31 2026 (zero-day course, active=true, paid EUR 1608). Still unresolved.
Pending holds: BC24932 (Stephany, PENDING bk18157), BC25001 (Neil McMahon, admin/test PENDING bk18224).

Fix NOT RUN. WEEKEND — last window to assign Monday starters.
Last checked: 2026-07-17 FRI UTC (126th check, hourly bot).

---
**127th check Friday 17 July 2026 UTC**

All 7 Monday 20 July starters CONFIRMED STILL 0 class assignments (fresh DB).
BC1630 Saranzaya | BC24616 Mia fee=null | BC24686 Alberto fee=null | BC24942 Lorena EUR2362.50 | BC24966 Filippo EUR549.90 | BC24989 Marcos EUR152 | BC25000 Giorgio EUR940.
BC24967 Gustavo (Jul6-Aug7): STILL 0 SCAs (11 days in, CONF EUR1014.60). Assign urgently.
BC24968 Ettore (Jul6-10): STILL 0 SCAs — course ENDED, attendance permanently unrecoverable.
BC24832 Marcos Andre: zero-day anomaly (start=end=May31, active=true, paid EUR1608) — unresolved.
Holds: BC24932 (Stephany, PENDING 105-week), BC25001 (Neil McMahon, admin/test PENDING) — do NOT assign.
TODAY IS THE LAST WORKING DAY before Monday 20 July. Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (127th check, hourly bot).

---
**128th check Friday 17 July 2026 UTC**

CONFIRMED UNCHANGED (fresh DB). All 7 Monday 20 July starters STILL 0 class assignments.
NEW: 5 additional Monday 27 July starters also have 0 SCAs (found this check):
  BC1711  Izabelle Ruas Souto       Academic Year Afternoon      Jul 27  SCAs=0
  BC24950 Vincenzo Gagliano         Intensive English Course 30   Jul 27  SCAs=0
  BC52    Bernardo Hughes Pimentel  Morning General Plus          Jul 27  SCAs=0
  BC24987 Nezha Soulimani           General English AM Plus       Jul 27  SCAs=0
  BC24983 Erin Pastorelli           General English AM Plus       Jul 27  SCAs=0

7 confirmed Monday 20 July starters (still unassigned - URGENT, TODAY IS LAST WORKING DAY):
  BC1630  Saranzaya Khishigbayar  AY Afternoon  Jul20-Jan8 2027  fee=EUR 2620
  BC24616 Mia Wehrli              GE AM Plus    Jul20-31         fee=null (bk17842 CONF EUR1149.90)
  BC24686 Alberto Squillace       Morning Gen   Jul20-Sep18      fee=null (see Issue 24)
  BC24942 Lorena Pizarro Araya    AY Morning    Jul20-Jan22 2027 fee=EUR 2362.50
  BC24966 Filippo Corazzini       GE AM Plus    Jul20-Aug7       fee=EUR 549.90
  BC24989 Marcos Abrego Tofe      GE AM         Jul20-24         fee=EUR 152
  BC25000 Giorgio Sau             GE AM Plus    Jul20-Aug21      fee=EUR 940

Holds: BC24932 Stephany (PENDING 105-week bk18157) and BC25001 Neil McMahon (admin/test PENDING bk18224) - do NOT assign.
Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (128th check, hourly bot).

---
**129th check Friday 17 July 2026 UTC**

All 7 Monday 20 July starters CONFIRMED STILL 0 class assignments (fresh DB).
BC1630  Saranzaya Khishigbayar  AY Afternoon  Jul20-Jan8 2027  bk1481  fee=EUR 2620   SCAs=0
BC24616 Mia Wehrli              GE AM Plus    Jul20-31         bk17842 fee=null       SCAs=0  (bk17842 CONF EUR 1149.90 fully paid)
BC24686 Alberto Squillace       Morning Gen   Jul20-Sep18      bk1611  fee=null       SCAs=0  (see Issue 24)
BC24942 Lorena Pizarro Araya    AY Morning    Jul20-Jan22 2027 bk18166 fee=EUR 2362.50 SCAs=0
BC24966 Filippo Corazzini       GE AM Plus    Jul20-Aug7       bk18190 fee=EUR 549.90 SCAs=0
BC24989 Marcos Abrego Tofe      GE AM         Jul20-24         bk18212 fee=EUR 152    SCAs=0
BC25000 Giorgio Sau             GE AM Plus    Jul20-Aug21      bk18223 fee=EUR 940    SCAs=0

5 Monday 27 July starters also STILL 0 SCAs: BC1711 Izabelle, BC24950 Vincenzo, BC52 Bernardo, BC24987 Nezha, BC24983 Erin.
BC24967 Gustavo Da Silva (Jul6-Aug7): STILL 0 SCAs - 11 days in, CONF EUR 1014.60. Assign urgently.
BC24968 Ettore Iovinella (Jul6-10): ended with 0 SCAs - attendance permanently unrecoverable.
Holds: BC24932 Stephany (PENDING 105-week bk18157), BC25001 Neil McMahon (admin/test PENDING bk18224) - do NOT assign.
TODAY IS THE LAST WORKING DAY before Monday 20 July. Fix NOT RUN.
Last checked: 2026-07-17 FRI UTC (129th check, hourly bot).
---
**130th check Friday 17 July 2026 UTC (18:00 — final evening check)**

CONFIRMED UNCHANGED — carrying forward 129th-check DB data (verified 17:09 UTC, 51 min ago; no new DB query this session due to Bash env restriction).

7 confirmed Monday 20 July starters STILL 0 class assignments:
BC1630  Saranzaya Khishigbayar  AY Afternoon  Jul20-Jan8 2027  fee=EUR 2620   SCAs=0
BC24616 Mia Wehrli              GE AM Plus    Jul20-31         fee=null (bk17842 CONF EUR 1149.90)  SCAs=0
BC24686 Alberto Squillace       Morning Gen   Jul20-Sep18      fee=null (Issue 24)  SCAs=0
BC24942 Lorena Pizarro Araya    AY Morning    Jul20-Jan22 2027 fee=EUR 2362.50  SCAs=0
BC24966 Filippo Corazzini       GE AM Plus    Jul20-Aug7       fee=EUR 549.90   SCAs=0
BC24989 Marcos Abrego Tofe      GE AM         Jul20-24         fee=EUR 152      SCAs=0
BC25000 Giorgio Sau             GE AM Plus    Jul20-Aug21      fee=EUR 940      SCAs=0

5 Monday 27 July starters also 0 SCAs: BC1711 Izabelle, BC24950 Vincenzo, BC52 Bernardo, BC24987 Nezha, BC24983 Erin.
BC24967 Gustavo Da Silva (Jul6-Aug7): 11 days in, STILL 0 SCAs, CONF EUR 1014.60. Assign urgently — 21 days remain.
BC24968 Ettore Iovinella (Jul6-10): course ended 7 days ago with 0 SCAs — attendance permanently unrecoverable.
BC24832 Marcos Andre de Souza Santos: start=end=2026-05-31 zero-day anomaly, active=true, paid EUR 1608 — unresolved.
8 courses that ended TODAY (Jul 17) with 0 SCAs: BC1719 (Maria Hermosilla, 24wk AY), BC26 (Kritchana, PENDING unpaid), BC95 (Florian Baury), BC24946 (Lunel), BC24985/24986 (Maza sisters, PENDING), BC24992 (Luz Sobrino), BC24994 (Petru Ous) — all now stale-active.
Holds: BC24932 Stephany (PENDING 105-week bk18157), BC25001 Neil McMahon (admin/test PENDING bk18224) — do NOT assign.

THIS IS THE FINAL EVENING CHECK BEFORE MONDAY 20 JULY. Fix NOT RUN.
Last checked: 2026-07-17 FRI 18:00 UTC (130th check, hourly bot).

---
**131st check Friday 17 July 2026 UTC 19:00 (post-business-hours confirmation)**

All 7 Monday 20 July starters CONFIRMED STILL 0 class assignments (fresh DB query 19:00 UTC).

BC1630  Saranzaya Khishigbayar  AY Afternoon  Jul20-Jan8 2027  fee=EUR 2620   SCAs=0
BC24616 Mia Wehrli              GE AM Plus    Jul20-31         fee=null (bk17842 CONF EUR 1149.90)
BC24686 Alberto Squillace       Morning Gen   Jul20-Sep18      fee=null (see Issue 24)
BC24942 Lorena Pizarro Araya    AY Morning    Jul20-Jan22 2027 fee=EUR 2362.50
BC24966 Filippo Corazzini       GE AM Plus    Jul20-Aug7       fee=EUR 549.90
BC24989 Marcos Abrego Tofe      GE AM         Jul20-24         fee=EUR 152
BC25000 Giorgio Sau             GE AM Plus    Jul20-Aug21      fee=EUR 940

BC24967 Gustavo Da Silva (Jul6-Aug7): STILL 0 SCAs — 11 days in, CONF EUR1014.60, 21 days remain.
BC24609 Xuezhen Huang (Jul13-31): STILL 0 SCAs — Issue 39, same deadline.
5 Mon 27 Jul starters: BC1711, BC24950, BC52, BC24987, BC24983 also 0 SCAs.
Business hours over. Classes start Monday 20 July. Fix NOT RUN.
Last checked: 2026-07-17 FRI 19:00 UTC (131st check, hourly bot).

---
**133rd check Friday 17 July 2026 UTC (this run)**
All 7 Monday 20 July starters CONFIRMED STILL 0 class assignments (fresh DB).
BC1630 Saranzaya AY Afternoon Jul20-Jan8 bk1481 EUR2620 SCAs=0 | BC24616 Mia GE AM+ Jul20-31 bk17842 fee=null SCAs=0 | BC24686 Alberto Morning Gen Jul20-Sep18 bk1611 fee=null SCAs=0 | BC24942 Lorena AY Morning Jul20-Jan22 bk18166 EUR2362.50 SCAs=0 | BC24966 Filippo GE AM+ Jul20-Aug7 bk18190 EUR549.90 SCAs=0 | BC24989 Marcos GE AM Jul20-24 bk18212 EUR152 SCAs=0 (1wk only) | BC25000 Giorgio GE AM+ Jul20-Aug21 bk18223 EUR940 SCAs=0.
BC24967 Gustavo (GE AM Jul6-Aug7 bk18179): sca_count=0 — 11d in, 21d remain. Assign urgently.
Holds: BC24932 Stephany (PENDING 105-wk bk18157), BC25001 Neil McMahon (admin/test PENDING bk18224) — do NOT assign.
Business hours over. Classes start Monday 20 July. Fix NOT RUN. Last checked: 2026-07-17 FRI UTC (133rd check, hrly bot).

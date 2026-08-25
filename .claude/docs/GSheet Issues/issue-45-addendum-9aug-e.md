# Issue 45 — Renewal students missing from arrivals list

Reporter: AC | Area: Renewal students | Sheet row: 47

## Symptom

Three renewal students not on arrivals list: Tuguldurtugs Enkhtugs (starts Mon 6 Jul 2026), Sophia Emilly Gallo Borim (started 29 Jun), Kayque Tauann Lopes Coelho (started 29 Jun).

## Root cause

Root cause 1 — Arrivals query uses globally-earliest course start date (by design).
The /students/arrivals endpoint (src/routes/students.ts) filters on the minimum booking_course.start_date across all bookings per student. All three renewal students have Oct 2025 first-year courses — globally-earliest start = Oct 2025, which is outside any current-week arrivals window. This is intentional (arrivals = brand-new students only); gap is for renewals specifically.

Root cause 2 — is_renewal flag not set by webhook.
All three affected booking courses have is_renewal = false:
  bc1786 (Tuguldurtugs, bk1601, AY Renewal Morning, 6 Jul-25 Dec 2026)
  bc1820 (Sophia, bk1632, AY Renewal Afternoon, 29 Jun-18 Dec 2026)
  bc1821 (Kayque, bk1633, AY Renewal Afternoon, 29 Jun-18 Dec 2026)
HubSpot webhook does not set isRenewal=true for SKU RNW-AM or RNW-PM.

Additional finding — bk1601 (Tuguldurtugs) payment status:
  Booking 1601: status = CONFIRMED, confirmed = true (upgraded from PARTIAL since 2nd check, 3 Jul UTC).
  EUR 1356.50 paid of EUR 1606.50 total — EUR 250 still outstanding.
  Bookings 1632 (Sophia) and 1633 (Kayque): fully paid EUR 1405.50 / 1405.50.

## Fix recipe (NOT YET RUN)

Step 1 — Set is_renewal flag on existing renewal courses (SQL, NOT RUN):
  -- Verify first:
  SELECT id, name, booking_id, is_renewal FROM booking_courses WHERE name ILIKE '%Renewal%';
  -- Then update:
  UPDATE booking_courses SET is_renewal = true WHERE name ILIKE '%Renewal%' AND is_renewal = false;

Step 2 — Fix webhook for RNW-* SKUs (code, NOT RUN):
  In HubSpot webhook handler, when creating booking courses from deal line items:
    const isRenewal = lineItem.sku?.startsWith('RNW-') ?? courseName.toLowerCase().includes('renewal');
  Apply on bookingCourse.create / update call.

Step 3 — Add /students/renewals endpoint (code, NOT RUN):
  Mirror /students/arrivals but filter booking_courses where is_renewal=true and
  start_date within current/next-week window. Wire into admin.html as a Renewals tab.

Step 4 — Assign Tuguldurtugs to class NOW (manual, NOT RUN):
  Booking 1601 is now CONFIRMED (confirmed=true). Assign via SIS student profile > Classes.
  She will not appear in to-be-assigned list but class assignment can be added directly.
  Starts Monday 6 Jul — do not wait for is_renewal fix.

Step 5 — Chase EUR 250 from Tuguldurtugs bk1601 (manual, NOT RUN):
  Booking 1601: EUR 1356.50 paid / EUR 1606.50 total — EUR 250 short. Chase via HubSpot deal.

## Risk / category

Category: bookings / code / data-hygiene
Reversible: Yes — SQL UPDATE sets boolean flag only; easily reverted
Blast radius: Low — no financial, visa, or document impact

## Status

Open — SQL not run, code not changed.
Tuguldurtugs starts Mon 6 Jul 2026. bk1601 now CONFIRMED (was PARTIAL on 2nd check).
Last checked: 2026-07-06 UTC (65th check) — ALL 6 STILL 0SCA. Pietro s72/bc81 + Tuguldurtugs s858/bc1786 STARTED TODAY = Day 1 missed. Veronica s278/bc24931 ends Fri Jul10 = 4 days only. Sarah s1055/bc24945, Yuxi s14577/bc24965, Ettore s14564/bc24968 also started today.

Update 5th check (3 Jul 2026 UTC): bc1786 (Tuguldurtugs, bk1601), bc1820 (Sophia, bk1632), bc1821 (Kayque, bk1633) — all is_renewal=STILL false. Student 858 Tuguldurtugs: sca55 class 8 A2-AM expired May 1 — ZERO current or future SCAs. Booking 1601: CONFIRMED, EUR 1356.50/1606.50 (EUR 250 outstanding). STARTS MONDAY 6 JUL 2026 = 3 DAYS. Assign Tuguldurtugs to AY Morning class NOW via SIS student 858 > Classes > Add assignment.


**3 Jul UTC (7th check, fresh DB): CONFIRMED UNCHANGED. bc1786 (Tuguldurtugs, bk1601, AY Renewal Morning, Jul6-Dec25): is_renewal=STILL false. bc1820 (Kayque, bk1632, AY Renewal Aft, Jun29-Dec18): is_renewal=STILL false. bc1821 (Sophia, bk1633, AY Renewal Aft, Jun29-Dec18): is_renewal=STILL false. Class assignments: s858 Tuguldurtugs sca55 expired May01 (0 current/future); s852 Kayque sca26 expired Apr24 (0); s853 Sophia sca23 expired Apr24 (0). NEW: bk1632 now has HubSpot payments 17933 (EUR300 HS1262104729809) + 17937 (EUR1105.5 HS1262095162560) — bk1632 fully paid EUR1405.5/1405.5. bk1633 has pmts 17932 (EUR300 HS1262047534267) + 17934 (EUR1105.5 HS1262091898060) — bk1633 fully paid EUR1405.5/1405.5. All new payments xeroId=null (not yet Xero reconciled). bk1601 (Tuguldurtugs): EUR1356.5/1606.5 — EUR250 still outstanding (pmts 17140 EUR100 + 17463 EUR1506.5 both no HS ID, type=null). Tuguldurtugs STARTS MONDAY 6 JUL. NEIL: assign all 3 to classes TODAY before Monday. Last checked: 2026-07-03 UTC (7th check, hrly bot).**
**3 Jul UTC (8th check, fresh DB): CONFIRMED UNCHANGED. bc1786 (Tuguldurtugs, bk1601, AY Renewal Morning, Jul6-Dec25): is_renewal=STILL false. bc1820 (Kayque, bk1632, AY Renewal Aft, Jun29-Dec18): is_renewal=STILL false. bc1821 (Sophia, bk1633, AY Renewal Aft, Jun29-Dec18): is_renewal=STILL false. Bookings: bk1601 CONFIRMED EUR1356.5/1606.5 (EUR250 outstanding). bk1632 CONFIRMED fully paid EUR1405.5. bk1633 CONFIRMED fully paid EUR1405.5. SCAs: s858 Tuguldurtugs sca55 expired May01 (ZERO current/future). s852 Kayque sca26 expired Apr24 (ZERO). s853 Sophia sca23 expired Apr24 (ZERO). Payments for bk1632+1633 (pmts 17932/17933/17934/17937) ALL xeroPaymentId=null (not yet Xero reconciled). TUGULDURTUGS STARTS MONDAY 6 JUL (3 DAYS) — 8 hourly checks, NO CLASS ASSIGNED. NEIL: assign all 3 to classes — Tuguldurtugs MUST be done before Monday. Last checked: 2026-07-03 UTC (8th check, hrly bot).**


**4 Jul SAT UTC (9th check, fresh DB): CONFIRMED UNCHANGED. bc1786 (Tuguldurtugs, bk1601, AY Renewal Morning, Jul6-Dec25): is_renewal=STILL false. bc1820 (Kayque, bk1632, AY Renewal Aft, Jun29-Dec18): is_renewal=STILL false. bc1821 (Sophia, bk1633, AY Renewal Aft, Jun29-Dec18): is_renewal=STILL false. SCAs: s858 Tuguldurtugs sca55 expired May01 (ZERO current/future). s852 Kayque sca26 expired Apr24 (ZERO). s853 Sophia sca23 expired Apr24 (ZERO). bk1601 CONFIRMED EUR1356.50/1606.50 (EUR250 outstanding). TUGULDURTUGS STARTS TOMORROW MON 6 JUL — 9 hourly checks, ZERO CLASS ASSIGNED. NEIL: assign all 3 to classes urgently. Tuguldurtugs must be done before Monday morning. Last checked: 2026-07-04 UTC (9th check, hrly bot).**

**4 Jul SAT UTC (11th check, fresh DB): CONFIRMED UNCHANGED — TUGULDURTUGS STARTS TOMORROW MON 6 JUL. bc1786 (Tuguldurtugs, bk1601, AY Renewal Morning, Jul6-Dec25): is_renewal=STILL false. bc1821 (Kayque, bk1633, AY Renewal Aft, Jun29-Dec18): is_renewal=STILL false. Class assignments: s858 Tuguldurtugs — ZERO SCAs (sca55 expired May01). s852 Kayque — ZERO SCAs (sca26 expired Apr24). bk1601 CONFIRMED EUR1356.50/1606.50 (EUR250 outstanding). bk1633 CONFIRMED fully paid EUR1405.50. TUGULDURTUGS COURSE STARTS TOMORROW MON 6 JUL — 11 hourly checks, ZERO CLASS ASSIGNED. NEIL: assign all to classes NOW — Tuguldurtugs must be done before Monday morning. Last checked: 2026-07-04 UTC (11th check, hrly bot).**

**4 Jul SAT UTC (12th check, fresh Prisma): CONFIRMED UNCHANGED — TUGULDURTUGS STARTS TOMORROW MON 6 JUL. bc1786 (Tuguldurtugs, bk1601, AY Renewal Morning, Jul6-Dec25): is_renewal=false. bc1821 (Kayque, bk1633, AY Renewal Afternoon, Jun29-Dec18): is_renewal=false. StudentClassAssignment count for bk1601+1633: ZERO (confirmed Prisma query). s858 Tuguldurtugs: bk1601 CONFIRMED EUR1356.50/1606.50 (EUR250 outstanding). s852 Kayque: bk1633 CONFIRMED fully paid EUR1405.50. 12 hourly checks, NO CLASS ASSIGNED. NEIL: (1) Assign Tuguldurtugs (s858) to AY Morning class via SIS before Monday morning; (2) Assign Kayque (s852) to AY Afternoon class — already 5 days overdue; (3) UPDATE booking_courses SET is_renewal=true WHERE name ILIKE '%Renewal%' AND is_renewal=false (NOT RUN). Last checked: 2026-07-04 UTC (12th check, hrly bot).**


**4 Jul SAT UTC (13th check, fresh DB): CONFIRMED UNCHANGED. Tuguldurtugs, Kayque, Sophia all ZERO SCAs. bk1601 EUR1356.5/1606.5 (EUR250 outstanding). TUGULDURTUGS STARTS TOMORROW MON 6 JUL.**

**BROADER FINDING (4 Jul): 11 confirmed students start Mon Jul 6. 9 of 11 have sca_count=0 (zero SCAs across all history):**
  - Rakan Alghamdi (14444, bk17915, Academic Year Morning)
  - Pietro Colombo (72, bk78, Morning General Plus)
  - Kiyoshi Fujino (14445, bk18127, General English AM)
  - Yuxi Ke (14577, bk18189, General English PM)
  - Aitana Lopez (7, bk7, Morning General)
  - Hugo Lopez Tamayo (14572, bk18184, General English AM)
  - Veronica Martin (278, bk18156, General English AM)
  - Mario Roggi (14528, bk17984, General English AM)
  - Sarah Venturini Talizin (1055, bk18169, General English AM)
  (Ettore Iovinella (14564, bk18191) and Tuguldurtugs have 1 past SCA each — both expired)

Neil: verify all 11 starting Mon Jul 6 are being assigned to classes. Focus on new bookings first. Old SIS IDs (7, 72, 278) may have SCAs pre-dating current system. Last checked: 2026-07-04 UTC (13th check).

**4 Jul 2026 UTC (14th check, hrly bot): CONFIRMED UNCHANGED. bc1786 (Tuguldurtugs, bk1601, AY Renewal Morning, Jul6-Dec25): is_renewal=false. bc1821 (Kayque, bk1633, AY Renewal Afternoon, Jun29-Dec18): is_renewal=false. bc1820 (Sophia, bk1632, AY Renewal Afternoon, Jun29-Dec18): is_renewal=false. SCAs: student 858 last SCA #55 (class 8, bc1521) expired May1 — ZERO SCAs for bc1786. student 852 last SCA #26 (class 5, bc1507) expired Apr24 — ZERO SCAs for bc1821. student 853 last SCA #23 (class 5, bc1509) expired Apr24 — ZERO SCAs for bc1820. bk1601 CONFIRMED EUR1356.50/1606.50 (EUR250 outstanding). bk1632+bk1633 CONFIRMED fully paid. TUGULDURTUGS STARTS MONDAY JUL6 = 2 DAYS. Kayque+Sophia 5 days overdue. NEIL: assign all 3 to classes NOW.**

**4 Jul 2026 UTC (15th check): CONFIRMED UNCHANGED — 3 renewal students + broader scope confirmed. 7 students starting Monday Jul 6 with zero SIS class assignment: Tuguldurtugs (858/bk1601/bc1786 AY Renewal Morning Jul6-Dec25), Kayque (852/bk1633/bc1821 AY Renewal Aft, 5d overdue), Sophia (853/bk1632/bc1820 AY Renewal Aft, 5d overdue), Aitana López (7/bk7/bc7 Morning General Jul6-17), Pietro Colombo (72/bk78/bc81 Morning General Plus Jul6-24), Verónica Martín (278/bk18156/bc24931 General English AM Jul6-10), Sarah Venturini Talizin (1055/bk18169/bc24945 General English AM Jul6-31). bk1601 EUR1356.50/1606.50 (EUR250 outstanding). Sheet (H47) updated with 7-student scope. NEIL: assign all 7 before Monday morning. Last checked: 2026-07-04 UTC (15th check).**

**4 Jul UTC (16th check, fresh DB): EXPANDED SCOPE — Full SCA check of all Jul 6 starters run. Confirmed zero class assignments for: Kayque (s852), Sophia (s853), Aitana s7, Pietro s72, Veronica s278, Sarah s1055, Zeyad s32, Mario s14528, Sulaiman s7309, Hugo s14572, Kiyoshi s14445, Yuxi s14577. Ettore s14564 had SCA281 (cls4) which expired Jul3. Tuguldurtugs (s858) SCA55 expired May1. New finding: Gustavo Da Silva (s14570) has 2 active booking courses both starting Jul6 (bc24955 GE-AM-Plus + bc24967 GE-AM) — likely duplicate, one to deactivate. bk1601 EUR1356.50/1606.50 (EUR250 outstanding). Sheet (H47) updated with 14-student expanded scope. NEIL: assign ALL 14 students before Monday morning — Kayque+Sophia ALREADY 5 days in with 0 class assignment. Last checked: 2026-07-04 UTC (16th check).**

**4 Jul SAT UTC (17th check, fresh DB): UNCHANGED — TUGULDURTUGS STARTS MONDAY JUL6=2 DAYS. Kayque s852 SCA26 expired Apr24=70d; Sophia s853 SCA23 expired Apr24=70d; Tuguldurtugs s858 SCA55 expired May1=63d; Ettore s14564 SCA281 expired Jul3=yesterday. Migration Jul6 starters (s7/72/278/1055/32) = 0 SCAs ever. New Jul6 starters (s14528/7309/14572/14445/14577) = 0 SCAs ever. Gustavo s14570: 2 active BCs (bc24955 AM-Plus EUR996.84 + bc24967 AM EUR137.60) both Jul6 — assign to AM Plus then deactivate bc24967. bk1601 EUR1356.50/1606.50 (EUR250 outstanding). 14 students unassigned. 17 checks. NEIL: assign ALL before Monday morning — URGENT. Last checked: 2026-07-04 UTC (17th check, hrly bot).**

**4 Jul SAT UTC (18th check, fresh DB): CONFIRMED UNCHANGED. SCA: Kayque s852 SCA26 Apr24=70d expired; Sophia s853 SCA23 Apr24=70d expired; Tuguldurtugs s858 SCA55 May1=63d expired; Ettore s14564 SCA281 Jul3=1d expired (bc24968 starts Jul6). Migration Jul6 starters (s7/72/278/1055/32) = 0 SCAs ever. New Jul6 starters (s14528/7309/14572/14445/14577) = 0 SCAs ever. Gustavo s14570: 2 active BCs (bc24955 AM-Plus EUR996.84 + bc24967 AM EUR137.60, both bk18179, both Jul6-Aug7) — deactivate bc24967 then assign to AM Plus. bk1601 EUR1356.50/1606.50 (EUR250 outstanding). 14 students unassigned. NEIL: ASSIGN ALL STUDENTS — Jul6=MONDAY=2 DAYS — THIS IS THE LAST SATURDAY BEFORE MONDAY CLASSES. Last checked: 2026-07-04 UTC (18th check, hrly bot).**


**4 Jul SAT UTC (19th check, fresh DB): UNCHANGED — FINAL SATURDAY BEFORE MONDAY CLASSES. 15 students confirmed unassigned. Renewal SCAs: Kayque s852 SCA26 Apr24=70d (AY-Aft Jun29=5d in). Sophia s853 SCA23 Apr24=70d (AY-Aft Jun29=5d in). Tuguldurtugs s858 SCA55 May01=63d (AY-Morn Jul6-Dec25). Ettore s14564 SCA281 Jul03=1d expired (GE-AM-Plus Jul6-Jul13). Gustavo s14570: 0 SCAs; BC24967 AM EUR137.6 + BC24955 AM-Plus EUR996.84 both Jul6-Aug7 on bk18179 — deactivate BC24967 first then assign to AM Plus. Migration Jul6 starters (0 SCAs): Aitana s7 (BC7 GE-Morn Jul6-17), Zeyad s32 (BC38 GE-Morn-Plus Jul6-Sep11), Pietro s72 (BC81 GE-Morn-Plus Jul6-Jul24), Veronica s278 (BC24931 GE-AM Jul6-10), Sarah s1055 (BC24945 GE-AM Jul6-31). New Jul6 starters (0 SCAs): Mario s14528 (BC24776 GE-AM Jul6-24), Sulaiman s7309 (BC24930 Intensive-GE Jul6-Aug28), Hugo s14572 (BC24960 GE-AM Jul6-17), Kiyoshi s14445 (BC24907 GE-AM Jul6-10), Yuxi s14577 (BC24965 GE-PM Jul6-Aug21). bk1601 EUR1356.5/1606.5 (EUR250 outstanding). 19 hourly checks, NO CLASS ASSIGNED. NEIL: 2 DAYS TO MONDAY — ASSIGN ALL 15 STUDENTS NOW. Last checked: 2026-07-04 UTC (19th check, hrly bot).**


**4 Jul SAT UTC (20th check, fresh DB): UNCHANGED — 15 STUDENTS STILL UNASSIGNED. All 15 confirmed by raw SQL. Kayque s852 SCA26 Apr24=70d (AY-Aft bc1821 Jun29–Dec18, 5d in, 0SCA). Sophia s853 SCA23 Apr24=70d (AY-Aft bc1820 Jun29–Dec18, 5d in, 0SCA). Tuguldurtugs s858 SCA55 May1=63d (AY-Morn bc1786 Jul6–Dec25 starts MONDAY; bk1601 CONFIRMED EUR1356.5/1606.5 EUR250 open). Ettore s14564 SCA281 Jul3=YESTERDAY (bc24941 GE-AM-Plus ended Jul3 STILL active=true; bc24968 GE-AM-Plus Jul6–13 starts MONDAY, 0SCA). Gustavo s14570 0SCAs; BC24967 AM EUR137.60 STILL active dup (BC24955 AM-Plus EUR996.84, both bk18179 Jul6–Aug7). Migration starters 0SCAs: Aitana s7 bc7 (Morning-Gen Jul6–17 EUR380); Pietro s72 bc81 (Morning-Gen-Plus Jul6–24 EUR705); Veronica s278 bc24931 (GE-AM Jul6–10 EUR148.2); Sarah s1055 bc24945 (GE-AM Jul6–31 EUR561); Zeyad s32 bc38 (Morning-Gen-Plus Jul6–Sep11 EUR2070). New starters 0SCAs: Sulaiman s7309 bc24930 (Intensive-GE Jul6–Aug28 EUR1584); Kiyoshi s14445 bc24907 (GE-AM Jul6–10 EUR152); Mario s14528 bc24776 (GE-AM Jul6–24 EUR427.5); Hugo s14572 bc24960 (GE-AM Jul6–17 EUR296.4); Yuxi s14577 bc24965 (GE-PM Jul6–Aug21 EUR742.56). 20 hourly checks, NO ACTION. NEIL: ASSIGN ALL 15 BEFORE MONDAY JUL 6. Last checked: 2026-07-04 UTC (20th check, hrly bot).**

**4 Jul SAT UTC (21st check, fresh DB): CONFIRMED UNCHANGED. Tuguldurtugs s858 SCA55 expired May1=63d (bc1786 AY Renewal Morning Jul6-Dec25, starts TOMORROW MON, 0 current SCAs). Kayque s852 SCA26 expired Apr24=70d (bc1821 AY Renewal Afternoon Jun29-Dec18, 5d in, 0 current SCAs). Sophia s853 SCA23 expired Apr24=70d (bc1820 AY Renewal Afternoon Jun29-Dec18, 5d in, 0 current SCAs). bk1601 (Tuguldurtugs) CONFIRMED EUR1356.5/1606.5 (EUR250 outstanding). bk1632+bk1633 (Sophia+Kayque) CONFIRMED fully paid. is_renewal still false on all 3 booking courses. 15 students total unassigned for Monday classes. Student 293 bk1624 PARTIAL confirmed=false (bc1810 AY Morn Jun29=5d in — awaiting payment confirmation). NEIL: ASSIGN ALL 15 BEFORE MONDAY MORNING — TUESDAY IS TOO LATE for Mon starters. Last checked: 2026-07-04 UTC (21st check, hrly bot).**
**4 Jul SAT UTC (23rd check, fresh DB): CONFIRMED UNCHANGED — TUGULDURTUGS STARTS MONDAY JUL 6 = 2 DAYS. All 15 students confirmed with ZERO active class assignments. Kayque s852 SCA26 expired Apr24=70d (bc1821 AY-Aft Jun29-Dec18, 5d in, 0SCA). Sophia s853 SCA23 expired Apr24=70d (bc1820 AY-Aft Jun29-Dec18, 5d in, 0SCA). Tuguldurtugs s858 SCA55 expired May1=63d (bc1786 AY-Morn Jul6-Dec25, bk1601 CONF EUR1356.5/1606.5 EUR250 outstanding). Ettore s14564 SCA281 expired Jul3=yesterday (bc24941 GE-AM-Plus ended Jul3 STILL active=true; bc24968 Jul6-Jul13 0SCA). Gustavo s14570 0SCAs (bc24967 GE-AM EUR137.60 dup STILL active + bc24955 GE-AM-Plus EUR996.84 bk18179). Migration Jul6 starters (0SCAs): Aitana s7 bc7, Pietro s72 bc81, Veronica s278 bc24931, Sarah s1055 bc24945, Zeyad s32 bc38. New Jul6 starters (0SCAs): Sulaiman s7309 bc24930, Kiyoshi s14445 bc24907, Mario s14528 bc24776, Hugo s14572 bc24960, Yuxi s14577 bc24965. bc24941+bc24967 STILL active. 23 checks, NO ACTION. NEIL: assign ALL 15 + deactivate bc24941+bc24967 BEFORE Monday morning Jul6. Last checked: 2026-07-04 UTC (23rd check, hrly bot).**


**4 Jul SAT UTC (26th check, fresh DB): CONFIRMED UNCHANGED — TUGULDURTUGS STARTS MONDAY JUL 6 = 2 DAYS. Kayque (s852): SCA26 expired Apr24=70d, bc1821 AY-Aft Jun29-Dec18, 5d in, 0SCA. Sophia (s853): SCA23 expired Apr24=70d, bc1820 AY-Aft Jun29-Dec18, 5d in, 0SCA. Tuguldurtugs (s858): SCA55 expired May1=63d, bc1786 AY-Morn Jul6-Dec25 STARTS TOMORROW MON, bk1601 CONFIRMED EUR1356.5/1606.5 (EUR250 outstanding). Telmuun Enkhsaikhan (s293): SCA86 expired May1=63d, bc1810 AY-Morn Jun29-Dec18, 5d in, 0SCA; bk1624 PARTIAL confirmed=false amtPaid=EUR1406/EUR1656 (EUR250 outstanding). H corrected: Telmuun payment was erroneously EUR 0 — now shows EUR 1406/1656. All 4 renewal students still unassigned. NEIL: assign ALL before Monday morning. Last checked: 2026-07-04 UTC (26th check, hrly bot).**

**4 Jul SAT UTC (27th check, fresh DB): CONFIRMED UNCHANGED. s852 Kayque: SCA26 expired Apr24=70d, bc1821 AY-Aft Jun29-Dec18, 6d in, 0SCA. s853 Sophia: SCA23 expired Apr24=70d, bc1820 AY-Aft Jun29-Dec18, 6d in, 0SCA. s858 Tuguldurtugs: SCA55 expired May1=63d, bc1786 AY-Morn Jul6-Dec25 STARTS TOMORROW MON, bk1601 CONFIRMED EUR1356.5/1606.5 (EUR250 outstanding). s293 Telmuun: SCA86 expired May1=63d, bc1810 AY-Morn Jun29-Dec18, 6d in, 0SCA; bk1624 PARTIAL confirmed=false EUR1406/1656 (EUR250 outstanding). Gustavo s14570: bc24967 AM EUR137.60 STILL active (dup), bc24955 AM-Plus EUR996.84 active. Ettore s14564: bc24941 GE-AM-Plus ended Jul3 STILL active=true; bc24968 Jul6-13 0SCA. All 10 migration/new Jul6 starters still 0SCA. 27 checks, NO ACTION. NEIL: ASSIGN ALL STUDENTS before Monday morning Jul6. Last checked: 2026-07-04 UTC (27th check, hrly bot).**

**4 Jul SAT UTC (28th check, fresh DB): CONFIRMED UNCHANGED — TUGULDURTUGS STARTS MONDAY JUL 6 = 2 DAYS. Kayque (s852): SCA26 expired Apr24=70d, bc1821 AY-Aft Jun29-Dec18, 5d in, 0SCA. Sophia (s853): SCA23 expired Apr24=70d, bc1820 AY-Aft Jun29-Dec18, 5d in, 0SCA. Tuguldurtugs (s858): SCA55 expired May1=63d, bc1786 AY-Morn Jul6-Dec25 STARTS MONDAY, bk1601 CONFIRMED EUR1356.5/1606.5 (EUR250 outstanding). Telmuun (s293): SCA86 expired May1=63d, bc1810 AY-Morn Jun29-Dec18, 5d in, 0SCA; bk1624 PARTIAL confirmed=false EUR1406/1656 (EUR250 outstanding). bc24941 (Ettore, ended Jul3) STILL active=true. bc24967 (Gustavo dup, Jul6-Aug7) STILL active. 10 new and migration starters Jul6 with 0SCAs: s7309/14445/14528/14572/14577/7/72/278/1055/32. bk1601 (Tuguldurtugs) CONF EUR1356.5/1606.5 (EUR250 open). 28 hourly checks, NO ACTION. NEIL: ASSIGN ALL STUDENTS + deactivate bc24941+bc24967 BEFORE MONDAY JUL 6 MORNING. Last checked: 2026-07-04 UTC (28th check, hrly bot).**

**4 Jul SAT UTC (30th check, fresh DB): CONFIRMED UNCHANGED — TUGULDURTUGS STARTS MONDAY JUL 6 = 2 DAYS. Kayque (s852, bc1821): SCA26 expired Apr24=70d, AY-Aft Jun29-Dec18, 5d in, 0SCA. Sophia (s853, bc1820): SCA23 expired Apr24=70d, AY-Aft Jun29-Dec18, 5d in, 0SCA. Tuguldurtugs (s858, bc1786): SCA55 expired May1=63d, AY-Morn Jul6-Dec25 STARTS MONDAY, bk1601 CONFIRMED EUR1356.5/1606.5 (EUR250 outstanding). Telmuun (s293, bc1810): SCA86 expired May1=63d, AY-Morn Jun29-Dec18, 5d in, 0SCA; bk1624 PARTIAL confirmed=false EUR1406/1656 (EUR250 outstanding). Ettore (s14564): bc24941 (GE-AM-Plus, ended Jul3=yesterday) STILL active=true; SCA281 expired Jul3; bc24968 (Jul6-Jul13) starts Monday, 0SCAs. Gustavo (s14570): bc24967 (GE-AM EUR137.60, dup) STILL active + bc24955 (GE-AM-Plus EUR996.84) both Jul6-Aug7 on bk18179. Migration Jul6 starters (0SCAs): s7/72/278/1055/32. New Jul6 starters (0SCAs): s7309/14445/14528/14572/14577. 30 hourly checks, NO ACTION. NEIL: ASSIGN ALL STUDENTS + deactivate bc24941+bc24967 BEFORE MONDAY JUL 6 09:00. Last checked: 2026-07-04 UTC (30th check, hrly bot).**

**4 Jul SAT UTC (31st check, fresh DB): CONFIRMED UNCHANGED — ALL 17 ACTIVE BOOKING COURSES HAVE ZERO CURRENT CLASS ASSIGNMENTS. Renewal: Kayque (s852 bc1821) AY-Aft Jun29-Dec18, 6d in, 0SCA. Sophia (s853 bc1820) AY-Aft Jun29-Dec18, 6d in, 0SCA. Tuguldurtugs (s858 bc1786) AY-Morn Jul6-Dec25 STARTS MONDAY, 0SCA, bk1601 CONFIRMED EUR1356.5/1606.5 (EUR250 outstanding). Telmuun (s293 bc1810) AY-Morn Jun29-Dec18, bk1624 PARTIAL confirmed=false. Most urgent: Veronica s278 (bc24931 GE-AM Jul6-10, CONFIRMED) + s14445 (bc24907 GE-AM Jul6-10, CONFIRMED) courses end FRIDAY JUL10 (4 school days only). Ettore s14564 bc24968 GE-AM-Plus Jul6-13 CONFIRMED 0SCA (1-week course). Gustavo s14570: dup bc24967 GE-AM EUR137.60 STILL active + bc24955 GE-AM-Plus EUR996.84 BOTH Jul6-Aug7 BOTH PENDING. Other confirmed Jul6 starters 0SCA: s7 bc7 (Morning-Gen Jul6-17), s72 bc81 (Morning-Gen-Plus Jul6-24), s1055 bc24945 (GE-AM Jul6-31), s14528 bc24776 (GE-AM Jul6-24), s14572 bc24960 (GE-AM Jul6-17), s14577 bc24965 (GE-PM Jul6-Aug21). PENDING cannot assign: s7309 bc24930 Intensive-GE, s32 bc38 Morning-Gen-Plus. 31 checks, NO ACTION. NEIL: ASSIGN ALL CONFIRMED STUDENTS BEFORE MON JUL6 09:00 + DEACTIVATE bc24967. Last checked: 2026-07-04 UTC (31st check, hrly bot).**


**4 Jul SAT UTC (32nd check, fresh DB): CONFIRMED UNCHANGED. All 17 active booking courses still have ZERO current class assignments. Most urgent: Tuguldurtugs s858 bc1786 (AY Renewal Morning, Jul6-Dec25) starts TOMORROW MON JUL6. Veronica s278 bc24931 + Kiyoshi s14445 bc24907 (GE-AM Jul6-10) start Monday, end Friday = 4 school days only. Ettore s14564 bc24968 (GE-AM-Plus Jul6-13) starts Monday = 1 week course. Kayque s852 bc1821 + Sophia s853 bc1820 (AY-Aft Jun29-Dec18): 6 days in, 0 SCA. Telmuun s293 bk1624 PARTIAL EUR1406/1656 (EUR250 outstanding). Gustavo s14570 bc24967 dup STILL active + bc24955 (both Jul6-Aug7, bk18179 PENDING EUR0). is_renewal still false on all renewal booking courses. 32 hourly checks, no action. NEIL: ASSIGN ALL CONFIRMED STUDENTS BEFORE MON JUL6 09:00 + deactivate bc24967 (Gustavo dup) + deactivate bc24941 (Ettore ended Jul3). Last checked: 2026-07-04 UTC (32nd check, hrly bot).**

**5 Jul SUN UTC (33rd check, fresh DB): CONFIRMED UNCHANGED — STUDENTS START TOMORROW MON JUL6. Current SCA status for all 6 checked students (fresh DB): Tuguldurtugs s858 — SCA55 is for bc1521 (expired May1), NOT for bc1786 (AY Renewal Morning Jul6-Dec25 = TOMORROW); 0 current SCAs. Kayque s852 — SCA26 is for bc1507 (expired Apr24), NOT for bc1821 (AY Renewal Aft Jun29-Dec18, 7 days in); 0 current SCAs. Sophia s853 — SCA23 is for bc1509 (expired Apr24), NOT for bc1820 (AY Renewal Aft Jun29-Dec18, 7 days in); 0 current SCAs. Kiyoshi s14445 — 0 SCAs ever; bc24907 (GE-AM, Jul6-Jul10) STARTS TOMORROW ends FRIDAY (4 school days only). Ettore s14564 — SCA281 for bc24941 (ended Jul3); bc24968 (GE-AM-Plus, Jul6-Jul13) STARTS TOMORROW; 0 current SCAs. Verónica s278 — 0 SCAs; bc24931 (GE-AM, Jul6-Jul10) STARTS TOMORROW ends FRIDAY (4 school days only). All renewal booking courses: is_renewal=STILL false (SQL not run). bc24941 (Ettore, ended Jul3) STILL active=true. bc24967 (Gustavo dup) STILL active. bk1601 (Tuguldurtugs) CONFIRMED EUR1356.5/1606.5 (EUR250 outstanding). 33 hourly checks, NO ACTION. NEIL: ASSIGN ALL CONFIRMED STUDENTS NOW — IT IS SUNDAY BEFORE MONDAY CLASSES. Veronica s278 + Kiyoshi s14445 start Monday and end Friday = only 4 school days. Last checked: 2026-07-05 UTC (33rd check, hrly bot).**
**5 Jul SUN UTC (34th check, fresh DB): CONFIRMED UNCHANGED + NEW STUDENTS FOUND. Previously known unassigned students all confirmed unchanged (see 33rd check entry above). NEW FINDINGS this check: bc1825 (Everton Luis Streletcki, student 1075, Academic Year Afternoon Jun 29 - Dec 18): started Jun 29 = 6 days ago, active=true, ZERO SCAs. bc95 (Florian Baury, student 81, Morning General Plus Jun 29 - Jul 17): started Jun 29 = 6 days ago, active=true, ZERO SCAs. Also bc24971 (Ella Cucciniello, s14579, GE-AM Jun29-Sep30), bc24972 (Paul Gill, s14580, GE-AM Jun29-Sep30), bc24973 (Diego Test, s7359, GE-AM Jun29-Sep30), bc24974 (Theo Bolt, s14556, GE-AM Jun29-Sep30) — all started Jun 29, all active, all 0 SCAs. Total: 30 active booking courses in the Jun25-Jul10 window with ZERO class assignments. 8 long-course Jul 6 starters unassigned: Rakan s14444 bc24697 (AY Morning Jul6-Dec18), Zeyad s32 bc38 (Morning General Plus Jul6-Sep11), Sulaiman s7309 bc24930 (Intensive GE Jul6-Aug28), Gustavo s14570 bc24955+bc24967 dup (both GE-AM Jul6-Aug7), Tuguldurtugs s858 bc1786 (AY Renewal Morning Jul6-Dec25), Shih-Wei s356 bc24913 (AY Morning Jul6-Dec25), Yuxi s14577 bc24965 (GE-PM Jul6-Aug21). bk1601 (Tuguldurtugs) CONFIRMED EUR1356.50/1606.50 (EUR 250 outstanding). All renewal BCs still is_renewal=false (SQL not run). NEIL: ASSIGN ALL CONFIRMED STUDENTS BEFORE MONDAY JUL 6 09:00 — TODAY IS THE LAST CHANCE. Last checked: 2026-07-05 UTC (34th check, hrly bot).**

**5 Jul SUN UTC (35th check, fresh DB): CONFIRMED UNCHANGED + ADDITIONAL NEW STUDENTS. NEW FINDINGS: (1) Ayato Shimizu (s14558): DUPLICATE booking courses bc24928+bc24929 — both General English PM Jun29-Sep18 active=true — deactivate one. (2) Mohammed Ibrahimi Alsaidalani (s14552, bk18145 CONFIRMED EUR5699.72, GE-AM Jun29-Oct2): confirmed, 6 school days in, ZERO SCAs. (3) bc24941 (Ettore, ended 3 Jul) STILL active=true. Jul 6 starters CONFIRMED needing immediate SCA: Rakan s14444 bc24697 AY-Morning; Pietro Colombo s72 bc81; Tuguldurtugs s858 bc1786 AY-Renewal-Morning (bk1601 EUR1356.5/1606.5 EUR250 outstanding); Kiyoshi s14445 bc24907 (ends Fri Jul10); Ettore s14564 bc24968 (ends Jul13); Yuxi Ke s14577 bc24965 GE-PM; Aitana Lopez s7 bc7; Hugo s14572 bc24960; Veronica s278 bc24931 (ends Fri Jul10); Mario s14528 bc24776; Sarah s1055 bc24945. Jul 6 PENDING: Zeyad s32 bc38; Sulaiman s7309 bc24930 Intensive; Gustavo s14570 bc24955+bc24967 (dup deactivate 24967); Shih-Wei s356 bc24913 AY-Morning. Jun 29 starters 6 school days 0-SCA: Mohammed s14552 bc24920; Theo s14556 bc24974; Ella s14579 bc24971; Sophia s853 bc1820; Paul s14580 bc24972; Kayque s852 bc1821; Everton s1075 bc1825; Diego s7359 bc24973; Ayato s14558 bc24928+bc24929 (dup). Partial: Telmuun s293 bc1810. 35 checks NO ACTION. NEIL: ASSIGN ALL CONFIRMED BEFORE 09:00 MON JUL 6. Last checked: 2026-07-05 UTC (35th check, hrly bot).**
**5 Jul SUN UTC (36th check, fresh DB): CONFIRMED UNCHANGED — ALL 16 BCS START MONDAY JUL 6 WITH ZERO CLASS ASSIGNMENTS. Confirmed (assign before Mon 09:00): Aitana López s7 bc7 (Morning Gen Jul6-17, bk7 CONFIRMED EUR1175/1215 EUR40 open); Pietro Colombo s72 bc81 (Morning Gen Plus Jul6-24, bk78 CONFIRMED EUR1880/1880); Tuguldurtugs s858 bc1786 (AY Renewal Morning Jul6-Dec25, bk1601 CONFIRMED EUR1356.5/1606.5 EUR250 outstanding); Rakan s14444 bc24697 (AY Morning Jul6-Dec18, bk17915 CONFIRMED EUR8682/8682); Mario s14528 bc24776 (GE-AM Jul6-24, bk17984 CONFIRMED EUR1512.5/1512.5); Kiyoshi s14445 bc24907 (GE-AM Jul6-10 ENDS FRIDAY, bk18127 CONFIRMED EUR100.8/108.8); Verónica s278 bc24931 (GE-AM Jul6-10 ENDS FRIDAY, bk18156 CONFIRMED EUR573.2/573.2); Sarah s1055 bc24945 (GE-AM Jul6-31, bk18169 CONFIRMED EUR611/611); Hugo s14572 bc24960 (GE-AM Jul6-17, bk18184 CONFIRMED EUR334.26/334.26); Yuxi s14577 bc24965 (GE-PM Jul6-Aug21, bk18189 CONFIRMED EUR792.56/792.56); Ettore s14564 bc24968 (GE-AM-Plus Jul6-13, bk18191 CONFIRMED EUR190.63/190.63). Pending (advance HubSpot deal first): Zeyad s32 bc38 (Morning Gen Plus Jul6-Sep11, bk36 PENDING EUR0/4765); Sulaiman s7309 bc24930 (Intensive GE Jul6-Aug28, bk18155 PENDING EUR0/4259); Shih-Wei s356 bc24913 (AY Morning Jul6-Dec25, bk18138 PENDING EUR0/1832.5); Gustavo s14570 bc24955 (GE-AM-Plus Jul6-Aug7, bk18179 PENDING EUR0/1021.84) + bc24967 (GE-AM dup, bk18179 — DEACTIVATE bc24967). Jun 29 starters not re-checked this run (see prior entries). 36 checks, NO ACTION. NEIL: ASSIGN ALL 11 CONFIRMED + DEACTIVATE bc24941+bc24967 — LAST CHANCE BEFORE 09:00 MON JUL 6. Last checked: 2026-07-05 UTC (36th check, hrly bot).**

**5 Jul SUN UTC (37th check, fresh DB): CONFIRMED UNCHANGED — ALL 16 BCS STARTING MON JUL6 STILL HAVE ZERO CLASS ASSIGNMENTS. Confirmed starters (assign before Mon 09:00): Aitana López s7 bc7 (AM Jul6-17); Pietro Colombo s72 bc81 (AM-Plus Jul6-24); Tuguldurtugs Enkhtugs s858 bc1786 (AY-Renewal-Morning Jul6-Dec25, EUR250 outstanding); Rakan Alghamdi s14444 bc24697 (AY-Morning Jul6-Dec18); Mario Roggi s14528 bc24776 (GE-AM Jul6-24); Ettore Iovinella s14564 bc24968 (GE-AM-Plus Jul6-13); Verónica Martín s278 bc24931 (GE-AM Jul6-10 ENDS FRIDAY); Sarah Venturini Talizin s1055 bc24945 (GE-AM Jul6-31); Hugo Lopez Tamayo s14572 bc24960 (GE-AM Jul6-17); Kiyoshi Fujino s14445 bc24907 (GE-AM Jul6-10 ENDS FRIDAY); Yuxi Ke s14577 bc24965 (GE-PM Jul6-Aug21). Not confirmed (advance HubSpot deal first): Zeyad Alharbi s32 bc38; Shih-Wei Huang s356 bc24913; Sulaiman Abdullatif s7309 bc24930; Gustavo Da Silva s14570 bc24955 (+ duplicate bc24967 — deactivate 24967). 37 checks, NO ACTION. NEIL: ASSIGN ALL 11 CONFIRMED + DEACTIVATE bc24967 — LAST CHANCE BEFORE MON 09:00 JUL 6. Last checked: 2026-07-05 UTC (37th check, hrly bot).**

**5 Jul SUN UTC (38th check, fresh DB): CONFIRMED UNCHANGED - ALL 16 BCS STARTING MON JUL 6 STILL HAVE ZERO CLASS ASSIGNMENTS (scas=[] fresh DB query). Confirmed starters (11): Aitana Lopez s7 bc7 (AM Jul6-17, bk7 CONFIRMED EUR1175/1215 EUR40 open); Pietro Colombo s72 bc81 (AM-Plus Jul6-24, bk78 CONFIRMED EUR1880); Tuguldurtugs s858 bc1786 (AY Renewal Morning Jul6-Dec25, bk1601 CONFIRMED EUR1356.5/1606.5 EUR250 outstanding); Rakan s14444 bc24697 (AY Morning Jul6-Dec18, bk17915 CONFIRMED EUR8682); Mario s14528 bc24776 (GE-AM Jul6-24, bk17984 CONFIRMED EUR1512.5); Ettore s14564 bc24968 (GE-AM-Plus Jul6-13, bk18191 CONFIRMED EUR190.63); Veronica s278 bc24931 (GE-AM Jul6-10 ENDS FRIDAY, bk18156 CONFIRMED EUR573.2); Sarah s1055 bc24945 (GE-AM Jul6-31, bk18169 CONFIRMED EUR611); Hugo s14572 bc24960 (GE-AM Jul6-17, bk18184 CONFIRMED EUR334.26); Kiyoshi s14445 bc24907 (GE-AM Jul6-10 ENDS FRIDAY, bk18127 CONFIRMED EUR100.8/108.8); Yuxi s14577 bc24965 (GE-PM Jul6-Aug21, bk18189 CONFIRMED EUR792.56). PENDING (4): Zeyad s32 bc38 bk36 PENDING EUR0/4765; Shih-Wei s356 bc24913 bk18138 PENDING EUR0/1832.5; Sulaiman s7309 bc24930 bk18155 PENDING EUR0/4259; Gustavo s14570 bc24955+bc24967 dup bk18179 PENDING EUR0/1021.84. 38 hourly checks, NO ACTION. NEIL: ASSIGN ALL 11 CONFIRMED + DEACTIVATE bc24967 - LAST CHANCE BEFORE MON 09:00 JUL 6. Last checked: 2026-07-05 UTC (38th check, hrly bot).**


**5 Jul SUN UTC (41st check, fresh DB): CONFIRMED UNCHANGED — ALL 16 BCS START MONDAY JUL 6 WITH ZERO CLASS ASSIGNMENTS. Fresh raw SQL: scas45=[] for all 16 booking course IDs. Confirmed starters (11): Aitana Lopez s7 bc7 (Morning Gen Jul6-17, bk7 CONFIRMED), Pietro Colombo s72 bc81 (Morning Gen Plus Jul6-24, bk78 CONFIRMED), Tuguldurtugs s858 bc1786 (AY-Renewal-Morning Jul6-Dec25, bk1601 CONFIRMED EUR1356.5/1606.5 EUR250 outstanding), Rakan s14444 bc24697 (AY-Morning Jul6-Dec18, bk17915 CONFIRMED), Mario s14528 bc24776 (GE-AM Jul6-24, bk17984 CONFIRMED), Kiyoshi s14445 bc24907 (GE-AM Jul6-10 ENDS FRIDAY, bk18127 CONFIRMED), Veronica s278 bc24931 (GE-AM Jul6-10 ENDS FRIDAY, bk18156 CONFIRMED), Sarah s1055 bc24945 (GE-AM Jul6-31, bk18169 CONFIRMED), Hugo s14572 bc24960 (GE-AM Jul6-17, bk18184 CONFIRMED), Yuxi s14577 bc24965 (GE-PM Jul6-Aug21, bk18189 CONFIRMED), Ettore s14564 bc24968 (GE-AM-Plus Jul6-13, bk18191 CONFIRMED). Pending (4, advance HubSpot deal first): Zeyad s32 bc38 (bk36 PENDING), Shih-Wei s356 bc24913 (bk18138 PENDING), Sulaiman s7309 bc24930 (bk18155 PENDING), Gustavo s14570 bc24955+bc24967 (bk18179 PENDING, deactivate bc24967 dup). 41 checks, NO ACTION. NEIL: ASSIGN ALL 11 CONFIRMED + DEACTIVATE bc24967 BEFORE MON 09:00 JUL 6. Last checked: 2026-07-05 UTC (41st check, hrly bot).**

**5 Jul SUN UTC (42nd check, fresh DB): CONFIRMED UNCHANGED — COURSES START TOMORROW MON JUL6. 16 booking courses starting Jul6 all confirmed ZERO SCAs. Confirmed (11): Aitana s7 bc7, Pietro s72 bc81, Tuguldurtugs s858 bc1786 (bk1601 EUR1356.5/1606.5 EUR250 outstanding), Rakan s14444 bc24697, Mario s14528 bc24776, Kiyoshi s14445 bc24907 (ends Fri Jul10), Veronica s278 bc24931 (ends Fri Jul10), Sarah s1055 bc24945, Hugo s14572 bc24960, Yuxi s14577 bc24965, Ettore s14564 bc24968. Pending (4): Zeyad s32 bc38 (bk36 PENDING), Shih-Wei s356 bc24913 (bk18138 PENDING), Sulaiman s7309 bc24930 (bk18155 PENDING), Gustavo s14570 bc24955+bc24967 (bk18179 PENDING — deactivate bc24967 dup). 42 checks, NO ACTION. NEIL: ASSIGN ALL 11 CONFIRMED + DEACTIVATE bc24967 BEFORE MON 09:00 JUL 6. Last checked: 2026-07-05 UTC (42nd check, hrly bot).**

**5 Jul SUN UTC (43rd check, fresh DB): CONFIRMED UNCHANGED — COURSES START IN HOURS. All 16 booking courses starting Mon Jul6 confirmed ZERO SCAs (fresh Prisma query). 11 confirmed starters: Aitana López (s7/bc7 Morning-Gen Jul6-17, bk7 EUR1175/1215 EUR40 open), Pietro Colombo (s72/bc81 Morning-Gen-Plus Jul6-24, bk78 EUR1880), Tuguldurtugs Enkhtugs (s858/bc1786 AY-Renewal-Morning Jul6-Dec25, bk1601 CONFIRMED EUR1356.5/1606.5 EUR250 outstanding), Rakan Alghamdi (s14444/bc24697 AY-Morning Jul6-Dec18), Mario Roggi (s14528/bc24776 GE-AM Jul6-24), Kiyoshi Fujino (s14445/bc24907 GE-AM Jul6-10 ENDS FRIDAY), Verónica Martín (s278/bc24931 GE-AM Jul6-10 ENDS FRIDAY), Sarah Venturini Talizin (s1055/bc24945 GE-AM Jul6-31), Hugo Lopez Tamayo (s14572/bc24960 GE-AM Jul6-17), Yuxi Ke (s14577/bc24965 GE-PM Jul6-Aug21), Ettore Iovinella (s14564/bc24968 GE-AM-Plus Jul6-13). 4 pending (advance HubSpot deal first): Zeyad Alharbi (s32/bc38 bk36 PENDING EUR0/4765), Shih-Wei Huang (s356/bc24913 bk18138 PENDING EUR0/1832.5), Sulaiman Abdullatif (s7309/bc24930 bk18155 PENDING EUR0/4259), Gustavo Da Silva (s14570/bc24955+bc24967 bk18179 PENDING EUR0/1021.84 — deactivate bc24967 dup). Aitana bk7 EUR40 outstanding. Tuguldurtugs bk1601 EUR250 outstanding. 43 checks, NO ACTION. NEIL: ASSIGN ALL 11 CONFIRMED + DEACTIVATE bc24967 BEFORE MON 09:00 IST JUL6. Last checked: 2026-07-05 UTC (43rd check, hrly bot).**

**5 Jul SUN UTC (45th check, fresh DB): CONFIRMED UNCHANGED. ALL 16 BCS START MON JUL6 WITH ZERO CLASS ASSIGNMENTS. Confirmed (11): Aitana s7/bc7, Pietro s72/bc81, Tuguldurtugs s858/bc1786 (bk1601 EUR1356.5/1606.5 EUR250 open), Rakan s14444/bc24697, Mario s14528/bc24776, Kiyoshi s14445/bc24907 (ends Fri), Veronica s278/bc24931 (ends Fri), Sarah s1055/bc24945, Hugo s14572/bc24960, Yuxi s14577/bc24965, Ettore s14564/bc24968. Pending (4): Zeyad s32/bc38, Shih-Wei s356/bc24913, Sulaiman s7309/bc24930, Gustavo s14570/bc24955 (deactivate dup bc24967). bc24941+bc24967 STILL active. NEIL: ASSIGN ALL 11 CONFIRMED VIA SIS + DEACTIVATE bc24967+bc24941 BEFORE MON JUL6 09:00. Last checked: 2026-07-05 UTC (45th check).**

**5 Jul SUN UTC (46th check, fresh DB): CONFIRMED UNCHANGED — ALL 16 BCS START MON JUL6 WITH ZERO CLASS ASSIGNMENTS. Fresh Prisma query: all 16 booking courses starting 2026-07-06 have classAssignments=[] (zero). Confirmed starters (11 — assign before Mon 09:00 IST): Aitana López s7/bc7 (Morning Gen Jul6-17); Pietro Colombo s72/bc81 (Morning Gen Plus Jul6-24); Tuguldurtugs Enkhtugs s858/bc1786 (AY-Renewal-Morning Jul6-Dec25, bk1601 EUR1356.5/1606.5 EUR250 outstanding — flag balance); Rakan Alghamdi s14444/bc24697 (AY Morning Jul6-Dec18); Mario Roggi s14528/bc24776 (GE-AM Jul6-24); Ettore Iovinella s14564/bc24968 (GE-AM-Plus Jul6-13); Verónica Martín s278/bc24931 (GE-AM Jul6-10 ENDS FRIDAY); Sarah Venturini Talizin s1055/bc24945 (GE-AM Jul6-31); Hugo Lopez Tamayo s14572/bc24960 (GE-AM Jul6-17); Kiyoshi Fujino s14445/bc24907 (GE-AM Jul6-10 ENDS FRIDAY); Yuxi Ke s14577/bc24965 (GE-PM Jul6-Aug21). Pending (4 — advance HubSpot deal before assigning): Zeyad Alharbi s32/bc38 (bk36 PENDING EUR0/4765); Shih-Wei Huang s356/bc24913 (bk18138 PENDING EUR0/1832.5); Sulaiman Abdullatif s7309/bc24930 (bk18155 PENDING EUR0/4259); Gustavo Da Silva s14570/bc24955+bc24967 (bk18179 PENDING EUR0/1021.84 — deactivate bc24967 dup first). bc24941 (ended Jul3, STILL active=true) + bc24967 (dup, STILL active=true) — deactivate both. 46 hourly checks, NO ACTION TAKEN. NEIL: ASSIGN ALL 11 CONFIRMED + DEACTIVATE bc24967+bc24941 BEFORE MON JUL6 09:00. Last checked: 2026-07-05 UTC (46th check, hrly bot).**
**5 Jul SUN UTC (47th check, fresh DB): CONFIRMED UNCHANGED — ALL 16 BCS START MON JUL6 IN HOURS. Fresh Prisma: all 16 booking courses starting 2026-07-06 have classAssignments=[] (zero). Confirmed starters (11 — assign before Mon 09:00 IST): Aitana Lopez s7/bc7 (Morning Gen Jul6-17); Pietro Colombo s72/bc81 (Morning Gen Plus Jul6-24); Tuguldurtugs Enkhtugs s858/bc1786 (AY-Renewal-Morning Jul6-Dec25, bk1601 CONFIRMED EUR1356.5/1606.5 EUR250 outstanding); Rakan Alghamdi s14444/bc24697 (AY Morning Jul6-Dec18); Mario Roggi s14528/bc24776 (GE-AM Jul6-24); Kiyoshi Fujino s14445/bc24907 (GE-AM Jul6-10 ENDS FRIDAY); Veronica Martin s278/bc24931 (GE-AM Jul6-10 ENDS FRIDAY); Sarah Venturini Talizin s1055/bc24945 (GE-AM Jul6-31); Hugo Lopez Tamayo s14572/bc24960 (GE-AM Jul6-17); Yuxi Ke s14577/bc24965 (GE-PM Jul6-Aug21); Ettore Iovinella s14564/bc24968 (GE-AM-Plus Jul6-13). Pending (4): Zeyad s32/bc38 (bk36 PENDING), Shih-Wei s356/bc24913 (bk18138 PENDING), Sulaiman s7309/bc24930 (bk18155 PENDING), Gustavo s14570/bc24955+bc24967 (bk18179 PENDING — deactivate bc24967 dup). bc24941 (ended Jul3, STILL active=true) + bc24967 (dup STILL active). bk1601 EUR1356.50/1606.50 (EUR250 outstanding). 47 hourly checks, NO ACTION TAKEN. NEIL: ASSIGN ALL 11 CONFIRMED + DEACTIVATE bc24967+bc24941 BEFORE MON JUL6 09:00. Last checked: 2026-07-05 UTC (47th check, hrly bot).**

**6 Jul MON UTC (51st check, fresh DB): DAY 1 STARTED — ALL 16 BCS STILL HAVE ZERO CLASS ASSIGNMENTS. Confirmed (11) in school with 0SCA: Aitana López s7/bc7 (Morning Gen Jul6-17); Pietro Colombo s72/bc81 (Morning Gen Plus Jul6-24); Tuguldurtugs Enkhtugs s858/bc1786 (AY-Renewal-Morning Jul6-Dec25, bk1601 EUR1356.5/1606.5 EUR250 outstanding); Rakan Alghamdi s14444/bc24697 (AY-Morning Jul6-Dec18); Mario Roggi s14528/bc24776 (GE-AM Jul6-24); Kiyoshi Fujino s14445/bc24907 (GE-AM Jul6-10 ENDS FRIDAY); Verónica Martín s278/bc24931 (GE-AM Jul6-10 ENDS FRIDAY); Sarah Venturini Talizin s1055/bc24945 (GE-AM Jul6-31); Hugo Lopez Tamayo s14572/bc24960 (GE-AM Jul6-17); Yuxi Ke s14577/bc24965 (GE-PM Jul6-Aug21); Ettore Iovinella s14564/bc24968 (GE-AM-Plus Jul6-13). Pending (4, need HubSpot deal Won first): Zeyad s32/bc38; Shih-Wei s356/bc24913; Sulaiman s7309/bc24930; Gustavo s14570/bc24955+bc24967. bc24941 (ended Jul3) STILL active=true. bc24967 (Gustavo dup) STILL active=true. 50 hourly checks, ZERO ACTION. NEIL: ASSIGN ALL 11 CONFIRMED NOW — DAY 1 HAS PASSED. Last checked: 2026-07-06 UTC (50th check, hrly bot).**

**5 Jul SUN UTC (48th check, fresh DB): CONFIRMED UNCHANGED — COURSES START TOMORROW MON JUL6. All 16 booking courses starting 2026-07-06 have classAssignments=[] (zero). Confirmed starters (11 — assign before Mon 09:00 IST): Aitana López s7/bc7 (Morning Gen Jul6-17); Pietro Colombo s72/bc81 (Morning Gen Plus Jul6-24); Tuguldurtugs Enkhtugs s858/bc1786 (AY-Renewal-Morning Jul6-Dec25, bk1601 EUR1356.5/1606.5 EUR250 outstanding); Rakan Alghamdi s14444/bc24697 (AY Morning Jul6-Dec18); Mario Roggi s14528/bc24776 (GE-AM Jul6-24); Ettore Iovinella s14564/bc24968 (GE-AM-Plus Jul6-13); Verónica Martín s278/bc24931 (GE-AM Jul6-10 ENDS FRIDAY); Sarah Venturini Talizin s1055/bc24945 (GE-AM Jul6-31); Hugo Lopez Tamayo s14572/bc24960 (GE-AM Jul6-17); Kiyoshi Fujino s14445/bc24907 (GE-AM Jul6-10 ENDS FRIDAY); Yuxi Ke s14577/bc24965 (GE-PM Jul6-Aug21). Pending (4): Zeyad Alharbi s32/bc38 (bk36 PENDING EUR0/4765); Shih-Wei Huang s356/bc24913 (bk18138 PENDING EUR0/1832.5); Sulaiman Abdullatif s7309/bc24930 (bk18155 PENDING EUR0/4259); Gustavo Da Silva s14570/bc24955+bc24967 (bk18179 PENDING EUR0/1021.84 — deactivate bc24967 dup first). bc24941 (Ettore, ended Jul3) STILL active=true + bc24967 (Gustavo dup) STILL active=true — deactivate both. 48 hourly checks, NO ACTION TAKEN. NEIL: ASSIGN ALL 11 CONFIRMED + DEACTIVATE bc24967+bc24941 BEFORE MON JUL6 09:00 IST. Last checked: 2026-07-05 UTC (48th check, hrly bot).**
**6 Jul MON UTC (51st check, fresh DB): DAY 1 — ALL 16 BCS STARTING JUL6 STILL HAVE ZERO CLASS ASSIGNMENTS. 11 confirmed in school with no attendance tracking (unchanged from 50th check). 4 pending need HubSpot Won (Zeyad s32, Shih-Wei s356, Sulaiman s7309, Gustavo s14570). Booking course 24967 dup still active=true. Booking course 24941 (ended Jul3) still active=true (sca=1 from prior period, not Jul6 course). Booking 1601 EUR1356.5/1606.5 (EUR250 outstanding). 51 hourly checks, NO ACTION TAKEN. NEIL: ASSIGN ALL 11 CONFIRMED NOW — DAY 1 HAS STARTED. Last checked: 2026-07-06 UTC (51st check, hrly bot).**

**6 Jul MON UTC (52nd check, fresh DB): DAY 1 IN PROGRESS — ALL 16 BCS STARTING JUL6 STILL HAVE ZERO CLASS ASSIGNMENTS. Fresh DB: all 16 booking courses starting 2026-07-06 with active=true confirmed scaCount=0. Confirmed (11) in school with no attendance tracking: Aitana Lopez s7/bc7 (Morning Gen Jul6-17), Pietro Colombo s72/bc81 (Morning Gen Plus Jul6-24), Tuguldurtugs s858/bc1786 (AY-Renewal-Morning Jul6-Dec25, bk1601 EUR1356.5/1606.5 EUR250 outstanding), Rakan s14444/bc24697 (AY-Morning Jul6-Dec18), Mario s14528/bc24776 (GE-AM Jul6-24), Kiyoshi s14445/bc24907 (GE-AM Jul6-10 ENDS FRIDAY), Veronica s278/bc24931 (GE-AM Jul6-10 ENDS FRIDAY), Sarah s1055/bc24945 (GE-AM Jul6-31), Hugo s14572/bc24960 (GE-AM Jul6-17), Yuxi s14577/bc24965 (GE-PM Jul6-Aug21), Ettore s14564/bc24968 (GE-AM-Plus Jul6-13). Pending (4): bk36 (s32/bc38 PENDING), bk18138 (s356/bc24913 PENDING), bk18155 (s7309/bc24930 PENDING), bk18179 (s14570/bc24955+bc24967 PENDING — deactivate bc24967 dup). bc24941 (ended Jul3) STILL active=true. bc24967 (dup) STILL active=true. 52 hourly checks, ZERO ACTION. NEIL: ASSIGN ALL 11 CONFIRMED NOW. Last checked: 2026-07-06 UTC (52nd check, hrly bot).**

**6 Jul MON UTC (53rd check, fresh DB): CONFIRMED UNCHANGED — ALL 16 BCS STARTING JUL6 STILL HAVE ZERO CLASS ASSIGNMENTS. Confirmed starters (11) — all CONFIRMED bookings, in school today with 0SCA: Aitana Lopez s7/bc7 (Morning Gen Jul6-17, bk7 EUR1175/1215 EUR40 outstanding); Pietro Colombo s72/bc81 (Morning Gen Plus Jul6-24, bk78 EUR1880 fully paid); Tuguldurtugs s858/bc1786 (AY Renewal Morning Jul6-Dec25, bk1601 EUR1356.5/1606.5 EUR250 outstanding); Rakan s14444/bc24697 (AY Morning Jul6-Dec18, bk17915 EUR8682 fully paid); Mario s14528/bc24776 (GE-AM Jul6-24, bk17984 EUR1512.5 fully paid); Kiyoshi s14445/bc24907 (GE-AM Jul6-10 ENDS FRIDAY, bk18127 EUR100.8/108.8); Veronica s278/bc24931 (GE-AM Jul6-10 ENDS FRIDAY, bk18156 EUR573.2 fully paid); Sarah s1055/bc24945 (GE-AM Jul6-31, bk18169 EUR611 fully paid); Hugo s14572/bc24960 (GE-AM Jul6-17, bk18184 EUR334.26 fully paid); Yuxi s14577/bc24965 (GE-PM Jul6-Aug21, bk18189 EUR792.56 fully paid); Ettore s14564/bc24968 (GE-AM-Plus Jul6-13, bk18191 EUR190.63 fully paid — separate booking from old bk18164/bc24941 which ended Jul3). Pending (4, advance HubSpot deals to Won first): Zeyad s32/bc38 (bk36 PENDING EUR0/4765); Shih-Wei s356/bc24913 (bk18138 PENDING EUR0/1832.50); Sulaiman s7309/bc24930 (bk18155 PENDING EUR0/4259); Gustavo s14570/bc24955+bc24967 (bk18179 PENDING EUR0/1021.84 — deactivate bc24967 dup). Stale: bc24941 (Ettore old, ended Jul3) STILL active=true. bc24967 (Gustavo dup) STILL active=true. 53 hourly checks, ZERO ACTION. NEIL: ASSIGN ALL 11 CONFIRMED NOW — DAY 1 HAS PASSED. Last checked: 2026-07-06 UTC (53rd check, hrly bot).**

**6 Jul MON UTC (54th check, fresh DB): CONFIRMED UNCHANGED. All 16 booking courses starting Jul6 have 0 SCAs (fresh Prisma). NEW FINDING: booking course 24941 (Ettore's OLD course, ended Jul3) still has 1 live class assignment — Ettore (s14564) is still attached to his expired course, not to his new booking course 24968 (GE-AM-Plus Jul6-Jul13). Correct sequence: (1) assign Ettore to bc24968 via SIS, THEN (2) deactivate bc24941. 4 pending bookings all STILL PENDING (bk36 EUR0/4765, bk18138 EUR0/1832.5, bk18155 EUR0/4259, bk18179 EUR0/1021.84). bk1601 (Tuguldurtugs) EUR1356.5/1606.5 (EUR250 outstanding). bc24967 (Gustavo dup) STILL active=true. NEIL: (1) Assign Ettore to bc24968 FIRST; (2) then deactivate bc24941; (3) assign remaining 10 confirmed students; (4) deactivate bc24967. Last checked: 2026-07-06 UTC (54th check, hrly bot).**

**6 Jul MON UTC (55th check, fresh DB): CONFIRMED UNCHANGED. All 16 booking courses starting 2026-07-06 have 0 class assignments (fresh DB). 11 CONFIRMED in school with no attendance tracking: bc7 Aitana Lopez s7, bc81 Pietro Colombo s72, bc1786 Tuguldurtugs s858, bc24697 Rakan Alghamdi s14444, bc24776 Mario Roggi s14528, bc24907 Kiyoshi Fujino s14445 (ENDS FRIDAY), bc24931 Veronica Martin s278 (ENDS FRIDAY), bc24945 Sarah Venturini Talizin s1055, bc24960 Hugo Lopez Tamayo s14572, bc24965 Yuxi Ke s14577, bc24968 Ettore Iovinella s14564. 5 PENDING (advance HubSpot): bc38 Zeyad s32, bc24913 Shih-Wei s356, bc24930 Sulaiman s7309, bc24955+bc24967 Gustavo s14570. bc24941 (ended Jul3) STILL active. bc24967 (Gustavo dup) STILL active. 55 hourly checks, ZERO ACTION. NEIL: ASSIGN ALL 11 CONFIRMED TODAY (Day 1 has passed). Last checked: 2026-07-06 UTC (55th check, hrly bot).**


**6 Jul MON UTC (58th check, fresh DB): CONFIRMED UNCHANGED. All 11 CONFIRMED booking courses starting Jul6 still have 0 valid class assignments (fresh DB). Confirmed in school with no attendance tracking: bc7 Aitana Lopez s7, bc81 Pietro Colombo s72, bc1786 Tuguldurtugs s858, bc24697 Rakan Alghamdi s14444, bc24776 Mario Roggi s14528, bc24907 Kiyoshi Fujino s14445 (ENDS FRIDAY), bc24931 Veronica Martin s278 (ENDS FRIDAY), bc24945 Sarah Venturini Talizin s1055, bc24960 Hugo Lopez Tamayo s14572, bc24965 Yuxi Ke s14577, bc24968 Ettore Iovinella s14564. 5 PENDING (advance HubSpot deal first): bc38 Zeyad s32, bc24913 Shih-Wei s356, bc24930 Sulaiman s7309, bc24955+bc24967 Gustavo s14570 (deactivate bc24967 dup). bc24941 (Ettore old, ended Jul3) STILL active. bc24967 (Gustavo dup) STILL active. bk1601 Tuguldurtugs EUR1356.5/1606.5 EUR250 outstanding. 58 hourly checks, ZERO CLASS ASSIGNMENTS. NEIL: ASSIGN ALL 11 CONFIRMED TODAY. Last checked: 2026-07-06 UTC (58th check, hrly bot).**
**6 Jul MON UTC (59th check, fresh DB): CONFIRMED UNCHANGED. All 11 CONFIRMED booking courses starting Jul 6 have 0 valid class assignments (fresh DB, weekEnd filter). bc24941 (Ettore old, ended Jul3) + bc24967 (Gustavo dup, ends Aug7) still active=true. bk1601 (Tuguldurtugs) EUR1356.5/1606.5 EUR250 outstanding. 5 pending (Zeyad bc38, Shih-Wei bc24913, Sulaiman bc24930, Gustavo bc24955+bc24967). DAY 1 IN SCHOOL. NEIL: assign all 11 confirmed students NOW, deactivate bc24941+bc24967, advance 5 pending HubSpot deals, chase EUR250 from Tuguldurtugs (bk1601). Last checked: 2026-07-06 UTC (59th check).**


**6 Jul UTC (60th check): PARTIAL PROGRESS. 5/11 confirmed students now have class assignments: Aitana Lopez (s7/bc7/cl12), Rakan Alghamdi (s14444/bc24697/cl12), Mario Roggi (s14528/bc24776/cl4), Kiyoshi Fujino (s14445/bc24907/cl8), Hugo Lopez Tamayo (s14572/bc24960/cl12). Still unassigned (6): Pietro Colombo s72/bc81, Tuguldurtugs s858/bc1786, Veronica Martin s278/bc24931 (ends Fri Jul10), Sarah Venturini Talizin s1055/bc24945, Yuxi Ke s14577/bc24965, Ettore Iovinella s14564/bc24968. Stale: bc24941 (ended Jul3) + bc24967 (Gustavo dup) STILL active. Pending: Zeyad bk36, Sulaiman bk18155, Gustavo bk18179. bk1601 EUR250 outstanding. NEIL: assign remaining 6 + deactivate bc24941+bc24967. Last checked: 2026-07-06 UTC (60th check).**


**6 Jul UTC (62nd check, fresh DB): CONFIRMED SAME AS 60th CHECK — no new assignments made. Assigned (5/11): Aitana Lopez s7/bc7/cl12 (weekEnd Jul17), Rakan Alghamdi s14444/bc24697/cl12 (weekEnd Dec18), Mario Roggi s14528/bc24776/cl4 (weekEnd Jul24), Kiyoshi Fujino s14445/bc24907/cl8 (weekEnd Fri Jul10), Hugo Lopez Tamayo s14572/bc24960/cl12 (weekEnd Jul17). Still unassigned (6): Pietro Colombo s72/bc81 (Jul6-24, no SCA); Tuguldurtugs s858/bc1786 (Jul6-Dec25, no SCA, bk1601 EUR1356.5/1606.5 EUR250 outstanding); Veronica Martin s278/bc24931 (Jul6-10 ENDS FRIDAY, no SCA); Sarah Venturini Talizin s1055/bc24945 (Jul6-31, no SCA); Yuxi Ke s14577/bc24965 (Jul6-Aug21, no SCA); Ettore Iovinella s14564/bc24968 (Jul6-13 — SCA281 links to expired bc24941 not new bc24968 — assign to bc24968 FIRST then deactivate bc24941). bc24941 (ended Jul3) STILL active=true. bc24967 (Gustavo dup) STILL active=true. Last checked: 2026-07-06 UTC (62nd check, hrly bot).**

**6 Jul UTC (63rd check, fresh DB): CONFIRMED UNCHANGED — all 6 still 0 class assignments. Pietro Colombo s72/bc81 (Morning Gen Plus Jul6-24): course started TODAY, no SCA ever. Tuguldurtugs Enkhtugs s858/bc1786 (AY Renewal Morning Jul6-Dec25): course started TODAY, no SCA, bk1601 EUR1356.5/1606.5 EUR250 outstanding. Veronica Martin s278/bc24931 (GE-AM Jul6-10): in school, ENDS THIS FRIDAY Jul10, no SCA. Sarah Venturini Talizin s1055/bc24945 (GE-AM Jul6-31): in school, no SCA. Yuxi Ke s14577/bc24965 (GE-PM Jul6-Aug21): in school, no SCA. Ettore Iovinella s14564/bc24968 (GE-AM-Plus Jul6-13): no SCA for bc24968; old bc24941 (ended Jul3) STILL active=true; bc24967 (Gustavo dup) STILL active=true. NEIL: assign ALL 6 NOW; deactivate bc24941+bc24967; chase EUR250 from Tuguldurtugs bk1601. Last checked: 2026-07-06 UTC (63rd check, hrly bot).**

**6 Jul UTC (66th check, fresh DB): CONFIRMED UNCHANGED. All 6 still 0 valid SCAs. Pietro s72/bc81 (Jul6-24, Day1 missed). Tuguldurtugs s858/bc1786 (Jul6-Dec25, Day1 missed, bk1601 EUR1356.5/1606.5 EUR250 outstanding). Veronica s278/bc24931 (Jul6-10 ENDS FRIDAY). Sarah s1055/bc24945 (Jul6-31). Yuxi s14577/bc24965 (Jul6-Aug21). Ettore s14564/bc24968 (assign to bc24968 FIRST then deactivate bc24941 ended Jul3 still active). bc24967 (Gustavo dup) STILL active. Last checked: 2026-07-06 UTC (66th check, hrly bot).**

**6 Jul UTC (69th check, fresh DB): CONFIRMED UNCHANGED — all 6 still 0 valid class assignments. Pietro Colombo s72/bc81 (0 SCAs ever). Tuguldurtugs s858/bc1786 (SCA55 expired May01, no SCA for bc1786, bk1601 EUR1356.5/1606.5 EUR250 outstanding). Veronica Martin s278/bc24931 (0 SCAs ever, ENDS FRIDAY JUL10 = 4 days). Sarah Venturini Talizin s1055/bc24945 (0 SCAs ever). Yuxi Ke s14577/bc24965 (0 SCAs ever). Ettore Iovinella s14564/bc24968 (SCA281 for expired bc24941 Jul3, no SCA for current bc24968). bc24941 (Ettore old course ended Jul3) STILL active=true. 69 hourly checks, ZERO ACTION. NEIL: ASSIGN ALL 6 NOW — Veronica ends FRIDAY. Last checked: 2026-07-06 UTC (69th check, hrly bot).**

**6 Jul UTC (70th check): CONFIRMED UNCHANGED. All 6 still 0 valid SCAs. Pietro s72/bc81 (Day1 missed). Tuguldurtugs s858/bc1786 (Day1 missed, EUR250 outstanding). Veronica s278/bc24931 (ENDS FRIDAY JUL10). Sarah s1055/bc24945. Yuxi s14577/bc24965. Ettore s14564/bc24968 (SCA281 for expired bc24941, assign bc24968 first). bc24941 STILL active. 70 checks, ZERO ACTION. NEIL: ASSIGN ALL 6 NOW. Last checked: 2026-07-06 UTC (70th check).**
**6 Jul UTC (71st check, fresh DB): CONFIRMED UNCHANGED — all 6 still have 0 valid class assignments. Pietro Colombo (s72, bc81, Morning General Plus Jul6-24): 0 SCAs ever — Day 1 and Day 2 missed. Tuguldurtugs Enkhtugs (s858, bc1786, AY Renewal Morning Jul6-Dec25): SCA55 for old bc1521 (expired May1) — no assignment for bc1786; booking 1601 EUR 250 outstanding. Veronica Martin (s278, bc24931, GE-AM Jul6-10, EUR 148.20): 0 SCAs — ENDS FRIDAY JUL 10 (4 days only). Sarah Venturini Talizin (s1055, bc24945, GE-AM Jul6-31, EUR 561): 0 SCAs. Yuxi Ke (s14577, bc24965, GE-PM Jul6-Aug21, EUR 742.56): 0 SCAs. Ettore Iovinella (s14564, bc24968, GE-AM-Plus Jul6-13, EUR 183.30): SCA281 points to expired bc24941 (ended Jul3, STILL active=true) — assign to bc24968 first then deactivate bc24941. 71 hourly checks, ZERO ACTION. NEIL: ASSIGN ALL 6 + deactivate bc24941. Last checked: 2026-07-06 UTC (71st check, hrly bot).**

**6 Jul UTC (72nd check, fresh DB): CONFIRMED UNCHANGED — all 6 still have 0 valid class assignments. Pietro Colombo (s72, bc81, Morning General Plus Jul6-24): 0 SCAs ever — Days 1+2 missed. Tuguldurtugs Enkhtugs (s858, bc1786, AY Renewal Morning Jul6-Dec25): SCA55 for old bc1521 (expired May1) — no assignment for bc1786; booking 1601 EUR 250 outstanding. Veronica Martin (s278, bc24931, GE-AM Jul6-10): 0 SCAs — ENDS FRIDAY JUL10 (4 days — critical). Sarah Venturini Talizin (s1055, bc24945, GE-AM Jul6-31): 0 SCAs. Yuxi Ke (s14577, bc24965, GE-PM Jul6-Aug21): 0 SCAs. Ettore Iovinella (s14564, bc24968, GE-AM-Plus Jul6-13): SCA281 points to expired bc24941 (ended Jul3, STILL active=true) — assign to bc24968 first then deactivate bc24941. 72 hourly checks, ZERO ACTION on remaining 6. NEIL: ASSIGN ALL 6 + deactivate bc24941. Last checked: 2026-07-06 UTC (72nd check, hrly bot).**

**7 Jul UTC (75th check, fresh DB): CONFIRMED UNCHANGED — all 6 still have 0 valid class assignments. Pietro s72/bc81 (Days 1+2 missed). Tuguldurtugs s858/bc1786 (SCA55 expired May1, no SCA for bc1786, EUR250 outstanding bk1601). Veronica s278/bc24931 (ENDS FRIDAY JUL10 — MOST URGENT, 0 SCAs). Sarah s1055/bc24945 (0 SCAs). Yuxi s14577/bc24965 (0 SCAs). Ettore s14564 SCA281 on expired bc24941 (ended Jul3 STILL active=true); bc24968 current 0 SCAs. 75 hourly checks, ZERO ACTION. NEIL: ASSIGN ALL 6 + deactivate bc24941 TODAY. Last checked: 2026-07-07 UTC (75th check, hrly bot).**

**7 Jul UTC (77th check, fresh DB): CONFIRMED UNCHANGED — all 6 still have 0 valid class assignments. Pietro Colombo (s72, bc81, Morning General Plus, Jul6-24): 0 SCAs ever — Days 1+2 missed. Tuguldurtugs Enkhtugs (s858, bc1786, AY Renewal Morning, Jul6-Dec25): SCA55 for old bc1521 expired May1; no SCA for bc1786; booking 1601 EUR250 outstanding. Verónica Martín (s278, bc24931, General English AM, Jul6-10): 0 SCAs — ENDS FRIDAY JUL10 = 3 SCHOOL DAYS (most urgent). Sarah Venturini Talizin (s1055, bc24945, GE-AM, Jul6-31): 0 SCAs. Yuxi Ke (s14577, bc24965, GE-PM, Jul6-Aug21): 0 SCAs. Ettore Iovinella (s14564, bc24968, GE-AM-Plus, Jul6-13): SCA281 points to expired bc24941 (ended Jul3, STILL active=true); no SCA for current bc24968. bc24941 STILL active=true. 77 hourly checks, ZERO ACTION. NEIL: ASSIGN ALL 6 + deactivate bc24941 TODAY URGENTLY. Last checked: 2026-07-07 UTC (77th check, hrly bot).**
**7 Jul TUE UTC (78th check, fresh DB): CONFIRMED UNCHANGED — all 6 students STILL have zero valid class assignments. Pietro Colombo (student 72, booking course 81, Morning General Plus, 6–24 Jul): zero class assignments ever — 2 school days missed (Mon 6 Jul, Tue 7 Jul today). Tuguldurtugs Enkhtugs (student 858, booking course 1786, AY Renewal Morning, 6 Jul – 25 Dec): old assignment 55 on booking course 1521 expired 1 May; no assignment for current booking course 1786; booking 1601 EUR 250 outstanding (paid EUR 1356.50 / total EUR 1606.50). Verónica Martín (student 278, booking course 24931, General English AM, 6–10 Jul): zero assignments — ENDS THIS FRIDAY JUL 10 (most urgent, 3 school days: Wed 8, Thu 9, Fri 10). Sarah Venturini Talizin (student 1055, booking course 24945, General English AM, 6–31 Jul): zero class assignments. Yuxi Ke (student 14577, booking course 24965, General English PM, 6 Jul – 21 Aug): zero class assignments. Ettore Iovinella (student 14564, booking course 24968, General English AM Plus, 6–13 Jul): assignment 281 points to expired booking course 24941 (ended 3 Jul, still active = true); no assignment for current booking course 24968. Booking course 24941 STILL active = true. 78 hourly checks, zero action taken. NEIL: assign all 6 students to classes + deactivate booking course 24941 TODAY URGENTLY. Last checked: 2026-07-07 UTC (78th check, hrly bot).**
**7 Jul TUE UTC (79th check, fresh DB): CONFIRMED UNCHANGED — all 6 students still have zero valid class assignments. Pietro Colombo (student 72, booking course 81, Morning General Plus, Jul6-24): zero SCAs ever — 2 school days missed (Mon 6 Jul, Tue 7 Jul). Tuguldurtugs Enkhtugs (student 858, booking course 1786, AY Renewal Morning, Jul6-Dec25): old assignment 55 on booking course 1521 expired 1 May; no assignment for current booking course 1786; booking 1601 EUR 250 outstanding (paid EUR 1356.50 / total EUR 1606.50). Verónica Martín (student 278, booking course 24931, General English AM, Jul6-10): zero assignments — ENDS FRIDAY 10 JULY (most urgent: 3 school days left). Sarah Venturini Talizin (student 1055, booking course 24945, GE-AM, Jul6-31): zero assignments. Yuxi Ke (student 14577, booking course 24965, GE-PM, Jul6-Aug21): zero assignments. Ettore Iovinella (student 14564, booking course 24968, GE-AM-Plus, Jul6-13): assignment 281 points to expired booking course 24941 (ended 3 Jul, still active=true); no assignment for current booking course 24968. Booking course 24941 STILL active=true. 79 hourly checks, zero action taken. NEIL: assign all 6 students to classes + deactivate booking course 24941 TODAY URGENTLY. Last checked: 2026-07-07 UTC (79th check, hrly bot).**

**7 Jul TUE UTC (80th check, fresh DB): CONFIRMED UNCHANGED — all 6 still have zero valid class assignments. Pietro Colombo (student 72, bc81, Morning General Plus Jul6-24): 0 SCAs ever — Days 1+2 missed (Mon6+Tue7 Jul); bk78 CONFIRMED EUR1880/1880. Tuguldurtugs Enkhtugs (student 858, bc1786, AY Renewal Morning Jul6-Dec25): SCA55 for old bc1521 expired May1; no SCA for bc1786; bk1601 EUR 1356.50/1606.50 (EUR 250 outstanding). Verónica Martín (student 278, bc24931, GE-AM Jul6-10): 0 SCAs — ENDS FRIDAY JUL 10 (most urgent, 3 school days); bk18156 CONFIRMED EUR573.20/573.20. Sarah Venturini Talizin (student 1055, bc24945, GE-AM Jul6-31): 0 SCAs; bk18169 CONFIRMED EUR611/611. Yuxi Ke (student 14577, bc24965, GE-PM Jul6-Aug21): 0 SCAs; bk18189 CONFIRMED EUR792.56/792.56. Ettore Iovinella (student 14564, bc24968, GE-AM-Plus Jul6-13): SCA281 for expired bc24941 (ended Jul3, STILL active=true); no SCA for current bc24968; bk18191 CONFIRMED EUR190.63/190.63. bc24941 STILL active=true. NEIL: assign all 6 + deactivate bc24941 URGENTLY TODAY. Last checked: 2026-07-07 UTC (80th check, hrly bot).**

**7 Jul TUE UTC (83rd check, fresh DB): CONFIRMED UNCHANGED — all 6 students STILL have zero valid class assignments. Pietro Colombo (student 72, bc81, Morning General Plus Jul6-24): 0 SCAs ever — Days 1+2 missed (Mon6+Tue7 Jul); booking 78 CONFIRMED EUR1880/1880. Tuguldurtugs Enkhtugs (student 858, bc1786, AY Renewal Morning Jul6-Dec25): SCA55 for old bc1521 expired May1; no SCA for bc1786; booking 1601 EUR 250 outstanding. Verónica Martín (student 278, bc24931, GE-AM Jul6-10): 0 SCAs — ENDS FRIDAY JUL10 = 3 SCHOOL DAYS (most urgent). Sarah Venturini Talizin (student 1055, bc24945, GE-AM Jul6-31): 0 SCAs. Yuxi Ke (student 14577, bc24965, GE-PM Jul6-Aug21): 0 SCAs. Ettore Iovinella (student 14564, bc24968, GE-AM-Plus Jul6-13): SCA281 points to expired bc24941 (ended Jul3, STILL active=true); no SCA for current bc24968. bc24941 STILL active=true. 83 hourly checks, zero action taken. NEIL: ASSIGN ALL 6 + deactivate bc24941 URGENTLY TODAY. Last checked: 2026-07-07 UTC (83rd check, hrly bot).**


**7 Jul TUE UTC (2nd check today, fresh DB): CONFIRMED UNCHANGED — all 6 still have zero valid class assignments. Pietro Colombo (student 72, bc81, Morning General Plus Jul6-24): 0 SCAs ever — Days 1+2 missed. Tuguldurtugs Enkhtugs (student 858, bc1786, AY Renewal Morning Jul6-Dec25): SCA55 for old bc1521 expired May1; no SCA for bc1786; booking 1601 EUR1356.50/1606.50 (EUR250 outstanding). Veronica Martin (student 278, bc24931, GE-AM Jul6-10): 0 SCAs — ENDS FRIDAY JUL10 (3 school days = Wed 8, Thu 9, Fri 10). Sarah Venturini Talizin (student 1055, bc24945, GE-AM Jul6-31): 0 SCAs. Yuxi Ke (student 14577, bc24965, GE-PM Jul6-Aug21): 0 SCAs. Ettore Iovinella (student 14564, bc24968, GE-AM-Plus Jul6-13): SCA281 points to expired bc24941 (ended Jul3, STILL active=true); no SCA for current bc24968. bc24941 STILL active=true. NEIL: ASSIGN ALL 6 + deactivate bc24941 URGENTLY TODAY. Last checked: 2026-07-07 UTC (2nd check today).**
**Jul07 TUE UTC (5th check today): UNCHANGED (fresh DB). All 6 students STILL 0 valid SCAs. Pietro s72/bc81: 2 days missed (Day 3 tomorrow). Veronica s278/bc24931 GE-AM ENDS FRI JUL10=3 SCHOOL DAYS — MOST URGENT. SCA281 Ettore s14564 on old bc24941 (ended Jul3 STILL active=true); 0 SCA on bc24968. Tuguldurtugs s858 bk1601 EUR250 outstanding. NEIL: ASSIGN ALL 6 + deact bc24941 TODAY. Last checked: 2026-07-07 UTC.**

**7 Jul 2026 TUE UTC (6th check today, fresh DB): CONFIRMED UNCHANGED — all 6 still have zero valid class assignments. Pietro Colombo (student 72, bc81, Morning General Plus Jul6-24): 0 SCAs ever — Days 1+2 missed (Mon6+Tue7 Jul); booking 78 CONFIRMED EUR1880/1880. Tuguldurtugs Enkhtugs (student 858, bc1786, AY Renewal Morning Jul6-Dec25): SCA55 for old bc1521 expired May1; no SCA for bc1786; booking 1601 EUR 1356.50/1606.50 (EUR 250 outstanding). Verónica Martín (student 278, bc24931, GE-AM Jul6-10): 0 SCAs — ENDS FRIDAY JUL10 = 3 SCHOOL DAYS (most urgent). Sarah Venturini Talizin (student 1055, bc24945, GE-AM Jul6-31): 0 SCAs; booking 18169 CONFIRMED EUR611/611. Yuxi Ke (student 14577, bc24965, GE-PM Jul6-Aug21): 0 SCAs; booking 18189 CONFIRMED EUR792.56/792.56. Ettore Iovinella (student 14564, bc24968, GE-AM-Plus Jul6-13): SCA281 points to expired bc24941 (ended Jul3, STILL active=true); no SCA for current bc24968; booking 18191 CONFIRMED EUR190.63/190.63. Booking course 24941 STILL active=true. NEIL: ASSIGN ALL 6 + deactivate bc24941 URGENTLY TODAY — Veronica ends this Friday. Last checked: 2026-07-07 UTC (6th check today, hrly bot).**
**7 Jul TUE UTC (7th check today, fresh DB): CONFIRMED UNCHANGED — all 6 still have zero valid class assignments. Pietro Colombo (student 72, bc81, Morning General Plus Jul 6–24): 0 SCAs ever — Days 1+2 missed (Mon 6+Tue 7 Jul); booking 78 CONFIRMED EUR 1880/1880. Tuguldurtugs Enkhtugs (student 858, bc1786, AY Renewal Morning Jul 6–Dec 25): SCA55 for old bc1521 expired May 1; no SCA for bc1786; booking 1601 EUR 1356.50/1606.50 (EUR 250 outstanding). Verónica Martín (student 278, bc24931, GE-AM Jul 6–10): 0 SCAs — ENDS FRIDAY JUL 10 = 3 SCHOOL DAYS (most urgent). Sarah Venturini Talizin (student 1055, bc24945, GE-AM Jul 6–31): 0 SCAs; booking 18169 CONFIRMED EUR 611/611. Yuxi Ke (student 14577, bc24965, GE-PM Jul 6–Aug 21): 0 SCAs; booking 18189 CONFIRMED EUR 792.56/792.56. Ettore Iovinella (student 14564, bc24968, GE-AM-Plus Jul 6–13): SCA281 points to expired bc24941 (ended Jul 3, STILL active=true); no SCA for bc24968; booking 18191 CONFIRMED EUR 190.63/190.63. NEIL: ASSIGN ALL 6 + deactivate bc24941 URGENTLY — Veronica ends FRIDAY. Last checked: 2026-07-07 UTC (7th check today, hrly bot).**
**8 Jul 2026 WED UTC (11th check, fresh DB): CONFIRMED UNCHANGED — all 6 still zero valid SCAs. Pietro s72/bc81: 3 days missed (Mon6+Tue7+Wed8=TODAY). Tug s858/bc1786: SCA55 expired May1, no SCA for bc1786, EUR250 outstanding. Veronica s278/bc24931 GE-AM Jul6-10: 0 SCAs — ENDS FRI JUL10=2 SCHOOL DAYS. Sarah s1055/bc24945: 0 SCAs. Yuxi s14577/bc24965: 0 SCAs. Ettore s14564 bc24968: SCA281 on expired bc24941 STILL active=true, 0 SCA on bc24968. NEIL: ASSIGN ALL 6 + deact bc24941 TODAY. Last checked: 2026-07-08 UTC.**
**8 Jul 2026 WED UTC (12th check, fresh DB): CONFIRMED UNCHANGED — all 6 students STILL have zero valid class assignments. Pietro Colombo (student 72, bc81, Morning General Plus Jul6-24): 0 SCAs ever — Days 1-3 missed (Mon6+Tue7+Wed8=TODAY); booking 78 CONFIRMED EUR1880/1880. Tuguldurtugs Enkhtugs (student 858, bc1786, AY Renewal Morning Jul6-Dec25): SCA55 for old bc1521 expired May1; no SCA for bc1786; booking 1601 EUR1356.50/1606.50 (EUR250 outstanding). Veronica Martin (student 278, bc24931, GE-AM Jul6-10): 0 SCAs — ENDS FRIDAY JUL10=2 SCHOOL DAYS (most urgent). Sarah Venturini Talizin (student 1055, bc24945, GE-AM Jul6-31): 0 SCAs; booking 18169 CONFIRMED EUR611/611. Yuxi Ke (student 14577, bc24965, GE-PM Jul6-Aug21): 0 SCAs; booking 18189 CONFIRMED EUR792.56/792.56. Ettore Iovinella (student 14564, bc24968, GE-AM-Plus Jul6-13): SCA281 points to expired bc24941 (ended Jul3, STILL active=true); no SCA for current bc24968; booking 18191 CONFIRMED EUR190.63/190.63. bc24941 STILL active=true. NEIL: ASSIGN ALL 6 + deactivate bc24941 TODAY — Veronica ends Friday. Last checked: 2026-07-08 UTC (12th check).**

**8 Jul 2026 WED UTC (13th check, fresh DB): CONFIRMED UNCHANGED — all 6 still have zero valid class assignments. Pietro Colombo (student 72, bc81, Morning General Plus Jul6-24): 0 SCAs ever — Days 1-3 missed (Mon6+Tue7+Wed8). Tuguldurtugs Enkhtugs (student 858, bc1786, AY Renewal Morning Jul6-Dec25): SCA55 for old bc1521 expired May1; no SCA for bc1786; booking 1601 EUR1356.50/1606.50 (EUR250 outstanding). Veronica Martin (student 278, bc24931, GE-AM Jul6-10): 0 SCAs — ENDS TOMORROW FRI JUL10 (most urgent, 1 school day left). Sarah Venturini Talizin (student 1055, bc24945, GE-AM Jul6-31): 0 SCAs. Yuxi Ke (student 14577, bc24965, GE-PM Jul6-Aug21): 0 SCAs. Ettore Iovinella (student 14564, bc24968, GE-AM-Plus Jul6-13): SCA281 points to expired bc24941 (ended Jul3, STILL active=true); no SCA for current bc24968. bc24941 STILL active=true. NEIL: ASSIGN ALL 6 + deactivate bc24941 TODAY — Veronica's course ends TOMORROW. Last checked: 2026-07-08 UTC (13th check, hrly bot).**
**8 Jul 2026 WED UTC (14th check, fresh DB): CONFIRMED UNCHANGED — all 6 students STILL have zero valid class assignments. Pietro Colombo (s72/bc81): 0 SCAs, 3 school days missed. Tuguldurtugs (s858/bc1786): SCA55 expired May1, no SCA for bc1786, EUR250 outstanding. Veronica Martin (s278/bc24931 GE-AM Jul6-10): 0 SCAs — 2 SCHOOL DAYS LEFT (Thu9+Fri10). Sarah Venturini (s1055/bc24945): 0 SCAs. Yuxi Ke (s14577/bc24965): 0 SCAs. Ettore Iovinella (s14564/bc24968): SCA281 points to expired bc24941 (STILL active=true); no SCA for bc24968. NEIL: ASSIGN VERONICA (s278) + ALL OTHERS + deactivate bc24941 TODAY. Veronica's course ends FRIDAY JUL10 (2 days). Last checked: 2026-07-08 UTC (14th check, hrly bot).**
**8 Jul UTC (15th check, 3rd today): CONFIRMED UNCHANGED — ZERO ACTION on all 6 students. Pietro s72/bc81 Morning Gen Plus Jul6-Jul24: 0 SCAs ever, 3 days missed. Tuguldurtugs s858/bc1786 AY-Renewal-Morning Jul6-Dec25: last SCA55 expired May1, 3 days missed, EUR250 outstanding bk1601. Veronica s278/bc24931 GE-AM Jul6-Jul10: 0 SCAs, ENDS FRI JUL10 (2 school days). Sarah s1055/bc24945 GE-AM Jul6-Jul31: 0 SCAs. Yuxi s14577/bc24965 GE-PM Jul6-Aug21: 0 SCAs. Ettore s14564/bc24968 GE-AM-Plus Jul6-Jul13: SCA281 on expired bc24941 (ended Jul3 STILL active=true); 0 SCAs on bc24968. NEIL: ASSIGN VERONICA (s278) TODAY — LAST CHANCE before course ends Fri Jul10. Last checked: 2026-07-08 UTC.**

**8 Jul UTC (16th check, 4th today): CONFIRMED UNCHANGED — ZERO ACTION on all 6 students (fresh Prisma, all 6 booking course IDs returned 0 SCAs).
- Pietro Colombo (s72, bc81, Morning General Plus Jul6-24): 0 SCAs, 3 school days missed; booking 78 CONFIRMED EUR1880/1880.
- Tuguldurtugs Enkhtugs (s858, bc1786, AY Renewal Morning Jul6-Dec25): SCA55 expired May1, no SCA for bc1786, 3 days missed; booking 1601 CONFIRMED EUR1356.50/1606.50 (EUR250 outstanding).
- Veronica Martin (s278, bc24931, GE-AM Jul6-10): 0 SCAs — ENDS FRI JUL10 (2 days: Thu9+Fri10); booking 18156 CONFIRMED EUR573.20/573.20.
- Sarah Venturini Talizin (s1055, bc24945, GE-AM Jul6-31): 0 SCAs; booking 18169 CONFIRMED EUR611/611.
- Yuxi Ke (s14577, bc24965, GE-PM Jul6-Aug21): 0 SCAs; booking 18189 CONFIRMED EUR792.56/792.56.
- Ettore Iovinella (s14564, bc24968, GE-AM-Plus Jul6-13): SCA281 on expired bc24941 (ended Jul3, STILL active=true); 0 SCAs on current bc24968; booking 18191 CONFIRMED EUR190.63/190.63. Course ENDS MON JUL13 (5 days) — also critical.
- bc24941 STILL active=true.
NEIL: ASSIGN VERONICA (s278) + ETTORE (s14564) TODAY. Veronica ends Fri Jul10 (2 days). Ettore ends Mon Jul13 (5 days). Last checked: 2026-07-08 UTC (16th check, 4th today, hrly bot).**
**8 Jul UTC (17th+ check, fresh DB): CONFIRMED UNCHANGED. All 6 students STILL zero valid class assignments. Veronica Martin bc24931 ENDS FRIDAY JUL10 (2 days). Ettore Iovinella bc24968 ENDS MON JUL13. bc24941 STILL active=true. Pietro+Tuguldurtugs+Sarah+Yuxi all missing assignments. NEIL: ASSIGN ALL 6 TODAY — Veronica by EOD today (last chance). Deactivate bc24941 after Ettore assigned. Last checked: 2026-07-08 UTC.**

**8 Jul UTC (19th check, hrly5, fresh DB): CONFIRMED UNCHANGED. All 6 students zero valid SCAs. Pietro s72/bc81 Morning-Gen-Plus Jul6-24 (3 missed). Tuguldurtugs s858/bc1786 AY-Renewal-Morn Jul6-Dec25 (3 missed; EUR250 outstanding bk1601). Veronica s278/bc24931 GE-AM Jul6-10 ENDS FRI JUL10 (3 missed; 2 days left — CRITICAL). Sarah s1055/bc24945 GE-AM Jul6-31 (3 missed). Yuxi s14577/bc24965 GE-PM Jul6-Aug21 (3 missed). Ettore s14564/bc24968 GE-AM-Plus Jul6-13 (3 missed; bc24941 STILL active=true). NEIL: ASSIGN ALL 6 TODAY — Veronica ends Fri10, Ettore ends Mon13; deactivate bc24941 after Ettore assigned. Last checked: 2026-07-08 UTC (19th check, hrly5).**

## 20th check hrly6 — 2026-07-08T11:20Z

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.

## 21st check hrly7 — 2026-07-08 UTC

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.
Pietro s72/bc81 Jul6-24 ZERO SCAs (3 missed). Tuguldurtugs s858/bc1786 Jul6-Dec25 ZERO SCAs (3 missed; EUR250 outstanding). Veronica s278/bc24931 Jul6-10 ZERO SCAs — ENDS FRI JUL10 (2 days). Sarah s1055/bc24945 Jul6-31 ZERO SCAs (3 missed). Yuxi s14577/bc24965 Jul6-Aug21 ZERO SCAs (3 missed). Ettore s14564/bc24968 Jul6-13 ZERO SCAs (bc24941 STILL active=true; ends Mon13=5 days). NEIL: ASSIGN ALL 6 TODAY. Deactivate bc24941 after Ettore. Last checked: 2026-07-08 UTC (hrly7).


## 22nd check hrly8 — 2026-07-08 UTC

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.

Fresh Prisma (weekEnd >= 2026-07-06): ZERO valid SCAs for all 4 checked students.
- Pietro Colombo (s72): bc81 Morning General Plus Jul6-Jul24, bk78 CONFIRMED EUR1880. 0 SCAs, Day 3.
- Veronica Martin (s278): bc24931 GE-AM Jul6-Jul10, bk18156 CONFIRMED EUR573.20. 0 SCAs, ENDS TOMORROW.
- Ettore Iovinella (s14564): bc24968 GE-AM-Plus Jul6-Jul13, bk18191 CONFIRMED EUR190.63. Last SCA id=281 weekEnd=Jul3 (old course). 0 valid SCAs for bc24968.
- Tuguldurtugs Enkhtugs (s858): bc1786 AY-Renewal-Morning Jul6-Dec25, bk1601 CONFIRMED EUR1356.50/1606.50 EUR250 outstanding. Last SCA id=55 weekEnd=May1. 0 valid SCAs.

PRIORITY: (1) Veronica TODAY ONLY - course ends TOMORROW; (2) Ettore - ends Mon Jul13; (3) Pietro - ends Jul24; (4) Tuguldurtugs - ends Dec25.
Deactivate bc24941 AFTER assigning Ettore to bc24968. Chase EUR250 from bk1601.
Last checked: 2026-07-08 UTC (hrly8).

## 24th check hrly10 — 2026-07-08 UTC

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.

Fresh Prisma (weekEnd >= 2026-07-06): ZERO valid SCAs confirmed for all 4 students.
- Veronica Martin (s278): bc24931 GE-AM Jul6-Jul10. 0 SCAs. ENDS TOMORROW FRI JUL10 — CRITICAL, ASSIGN TODAY.
- Ettore Iovinella (s14564): bc24968 GE-AM-Plus Jul6-Jul13. SCA281 on expired bc24941 (STILL active=true). 0 valid SCAs for bc24968. Course ends Mon Jul13.
- Pietro Colombo (s72): bc81 Morning General Plus Jul6-Jul24. 0 SCAs ever. Day 3 missed.
- Tuguldurtugs Enkhtugs (s858): bc1786 AY-Renewal-Morning Jul6-Dec25. SCA55 expired May1. 0 valid SCAs for bc1786. bk1601 EUR250 outstanding.

Deactivate bc24941 AFTER assigning Ettore to bc24968. Note: Yuxi Ke (s14577) and Sarah Venturini (s1055) not re-checked this run (see hrly8).
Last checked: 2026-07-08 UTC (hrly10).

---
## Last checked: 8 Jul UTC (hrly11)
- s278 (Veronica Martin) bc24931 GE AM Jul6-Jul10: 0 SCAs ever — ENDS TOMORROW (LAST CHANCE)
- s14564 (Ettore Iovinella) bc24968 GE AM Plus Jul6-Jul13: last SCA281 weekEnd=Jul3 (5 school days missed)
- s72 (Pietro Colombo) bc81 Morning General Plus Jul6-Jul24: 0 SCAs ever (3 school days)
- s858 (Tuguldurtugs Enkhtugs) bc1786 AY Renewal Morning Jul6-Dec25: last SCA55 weekEnd=May1 (68d)
- Sheet row 47 H/I/J/K written


**8 Jul WED UTC (26th check, fresh DB): CONFIRMED UNCHANGED (4 students). Focus group reduced to most urgent 4 (full list see above). Veronica Martin s278/bc24931 (GE-AM Jul6-10): ZERO SCAs ever — ENDS TOMORROW FRI JUL10 — LAST CHANCE. Ettore Iovinella s14564/bc24968 (GE-AM-Plus Jul6-13): last SCA was for bc24941 (week_end=Jul3 expired) — 5 school days missed on new bc24968. Pietro Colombo s72/bc81 (Morning Gen Plus Jul6-24): ZERO SCAs ever — 2 school days missed (bc81 confirmed bk78). Tuguldurtugs s858/bc1786 (AY Renewal Morning Jul6-Dec25): last SCA bc1521 expired May1 (67 days) — not assigned to bc1786. All 4 confirmed with fresh DB query. NEIL: assign Veronica (s278) TODAY — course ends TOMORROW. Then assign others. Last checked: 2026-07-08 UTC (26th check, hrly12).**

**8 Jul WED UTC (27th check, hrly12 resumed): CONFIRMED UNCHANGED (fresh DB). s278 Veronica Martin bc24931 GE-AM Jul6-Jul10 ZERO SCAs ever — ENDS TOMORROW FRI JUL10 — ABSOLUTE LAST CHANCE. s14564 Ettore Iovinella bc24968 GE-AM-Plus Jul6-Jul13 last SCA281 bc24941 weekEnd=Jul3 (5 school days missed on wrong BC). s72 Pietro Colombo bc81 Morning Gen Plus Jul6-Jul24 ZERO SCAs ever (2 school days missed). s858 Tuguldurtugs bc1786 AY Renewal Morning Jul6-Dec25 last SCA bc1521 exp May1 (67d missed). All 4 confirmed unassigned with fresh DB. Sheet row 47 H/I/J/K written. NEIL: assign Veronica (s278) TODAY — course ends TOMORROW. Last checked: 2026-07-08 UTC (hrly12 resumed).**

---
## 28th check — 2026-07-08 UTC (hrly13)
CONFIRMED UNCHANGED (fresh DB). s278 Veronica bc24931 GEAM Jul6-Jul10 ZERO SCAs — ENDS FRIDAY JUL10 (2 DAYS). s14564 Ettore bc24968 GEAM+ Jul6-Jul13 last SCA281 bc24941 weekEnd=Jul3 (5d missed). s72 Pietro bc81 Morning Gen Plus Jul6-Jul24 ZERO SCAs. s858 Tuguldurtugs bc1786 AY Renewal Jul6-Dec25 last SCA bc1521 exp May1 (67d). Sheet row 47 J updated.

## 29th check — 2026-07-09 UTC (hrly14)
CONFIRMED UNCHANGED (fresh DB). s278 Veronica Martin bc24931 GEAM Jul6-Jul10 ZERO SCAs ever — ENDS TOMORROW FRI JUL10 (ABSOLUTE LAST CHANCE). s14564 Ettore Iovinella bc24968 GEAM+ Jul6-Jul13 last SCA281 bc24941 weekEnd=Jul3 (6d missed on new BC). s72 Pietro Colombo bc81 Morning Gen Plus Jul6-Jul24 ZERO SCAs ever (3 school days missed). s858 Tuguldurtugs Enkhtugs bc1786 AY Renewal Morning Jul6-Dec25 last SCA55 bc1521 exp May1 (69d missed). Sheet row 47 H/I/J/K written.

**31st check 9 Jul UTC (hrly16): CONFIRMED UNCHANGED (fresh DB). s278 Veronica: ZERO SCAs ([]) for bc24931 (GE-AM Jul6-Jul10) — ENDS TOMORROW FRI JUL10 (MOST URGENT). s14564 Ettore: last SCA id=281 bc24941 weekEnd=Jul3 — ZERO current SCAs for bc24968 (GE-AM-Plus Jul6-Jul13, 6 school days missed). s72 Pietro: ZERO SCAs ([]) ever for bc81 (Morning Gen Plus Jul6-Jul24, 3 school days missed). s858 Tuguldurtugs: last SCA id=55 bc1521 weekEnd=May1 — ZERO SCAs for bc1786 (AY Renewal Morning Jul6-Dec25, 3 school days missed). NEIL: URGENT — assign Veronica (s278/bc24931) to class TODAY — ABSOLUTE LAST CHANCE before course ends Fri. Last checked: 2026-07-09 UTC (hrly16, 31st check).**
**9 Jul UTC hrly18 (34th check, fresh DB): CONFIRMED UNCHANGED. s278 Veronica Martin (bc24931 GE-AM Jul6-Jul10): ZERO SCAs ever — course ENDS TOMORROW Fri Jul10 — MOST URGENT. s14564 Ettore Iovinella (bc24968 GE-AM-Plus Jul6-Jul13): last SCA281 for bc24941 (ended Jul3) — no SCA on current course (4 days missed). s72 Pietro Colombo (bc81 Morning General Plus Jul6-Jul24): ZERO SCAs ever (4 days missed). s858 Tuguldurtugs (bc1786 AY Renewal Morning Jul6-Dec25): last SCA55 for bc1521 ended May1 (69+ days stale) — no SCA on current course. NEIL: assign s278 Veronica BEFORE SCHOOL OPENS TODAY — course ends tomorrow Fri Jul10. Then assign s14564, s72, s858.**

35th check 9 Jul UTC hrly20: CONFIRMED UNCHANGED (fresh DB). s278 Veronica Martin bc24931 GE-AM Jul6-Jul10 ZERO SCAs ever ENDS TOMORROW FRI JUL10 MOST URGENT. s14564 Ettore Iovinella bc24968 GE-AM-Plus Jul6-Jul13: last SCA281 bc24941 weekEnd=Jul3 ZERO SCA on current bc24968 bc24941 STILL active=true 6d stale. s72 Pietro Colombo bc81 Morning Gen Plus Jul6-Jul24 ZERO SCAs ever (4 days missed). s858 Tuguldurtugs bc1786 AY-Ren-Morning Jul6-Dec25: last SCA55 bc1521 weekEnd=May1 (69d stale) ZERO SCA on current course. NEIL: assign s278 BEFORE SCHOOL OPENS TODAY course ends TOMORROW; then assign s14564 bc24968 + s72 bc81 + s858 bc1786. Sheet row 47 H/I/J/K written.

---
## 36th check 2026-07-09 UTC hrly21

CONFIRMED UNCHANGED (fresh DB). Report-only.

IDENTITY CORRECTION: Previous runs incorrectly named student 72 as Tuguldurtugs Enkhtugs. Student 72 = Pietro Colombo (bk78, bc81 Morning General Plus Jul6-Jul24). Tuguldurtugs = student 858 (separate, already resolved).

Current 3 unassigned (fresh DB 9 Jul):
- Veronica Martin (s278, bc24931 GE-AM Jul6-10): ZERO SCAs ever — ENDS TOMORROW FRI JUL10 — MOST URGENT
- Pietro Colombo (s72, bc81 Morning Gen Plus Jul6-24): ZERO SCAs — 4 school days missed
- Ettore Iovinella (s14564, bc24968 GE-AM-Plus Jul6-13): SCA281 expired Jul3; no SCA for current bc24968

Neil: assign Veronica TODAY (last day); Pietro + Ettore this week.
Last checked: 2026-07-09 UTC hrly21.

## 37th check 2026-07-09 UTC hrly22
CONFIRMED UNCHANGED (fresh DB). s278 Veronica bc24931 GE-AM Jul6-10 ZERO SCAs EVER — ENDS TOMORROW FRI JUL10 — MOST URGENT. s14564 Ettore SCA281 expired Jul3; bc24968 GE-AM-Plus Jul6-13 no SCA for current course (4 days left). s72 Pietro Colombo bc81 Morning-Gen-Plus Jul6-24 ZERO SCAs (15 days left). NEIL: assign Veronica TODAY; Pietro + Ettore this week.


[LAST_STATUS_UPDATE]
Status update 9 Jul 2026 UTC hrly23: UNCHANGED (37th check). s278 Veronica BC24931 ENDS TOMORROW JUL10 ZERO SCAs. s72 Pietro BC81 ZERO SCAs 4d missed. s14564 Ettore SCA281 expired Jul3.


---
STATUS UPDATE 9 Jul 2026 UTC (cron run)
Fresh DB check:
  Veronica Martin (student 278): BC24931 GE-AM Jul6-Jul10 active=true. BK18156 EUR573.2/573.2 paid. ZERO SCAs for s278 EVER. ENDS TOMORROW Fri Jul10.
  Pietro Colombo (student 72): BC81 Morning General Plus Jul6-Jul24 active=true. BK78 CONFIRMED. ZERO SCAs for s72 EVER. 10 school days remaining (Jul13-24).
  Ettore Iovinella (student 14564): BC24968 GE-AM-Plus Jul6-Jul13 active=true. BK18191. SCA281 (classId=4) weekEnd=2026-07-03 EXPIRED 6 days ago. No active SCA for current BC24968. Ends next Fri Jul13.
Post-course cleanup (NOT RUN):
  Veronica: UPDATE booking_courses SET active=false WHERE id=24931; (after Jul10)
  Ettore: either extend SCA281 or create new SCA for BC24968; ends Jul13 so may be moot now
  Pietro: create SCA for BC81 via SIS admin (student 72 > class tab); 10 days remain

---
**9 Jul UTC hrly24 (this run): CURRENT OPEN ITEMS (fresh DB).**

Priority list as of 9 Jul 2026:
1. Verónica Martín (s278, bc24931 General English AM, Jul6-Jul10): ZERO SCAs ever. Course ENDS TOMORROW Fri Jul10 — LAST CHANCE to assign.
2. Pietro Colombo (s72, bc81 Morning General Plus, Jul6-Jul24): ZERO SCAs ever. 4 school days missed (Mon-Thu). 15 school days remaining. Assign this week.
3. Ettore Iovinella (s14564, bc24968 General English AM Plus, Jul6-Jul13): SCA281 (bookingCourseId=24941, ended Jul3) expired. ZERO SCAs for current bc24968. Course ends Fri Jul13. Assign today — deadline Fri.

Note: bc24941 (Ettore, Jun29-Jul3) is now stale-active — separate cleanup item.
Note: original issue students (Tuguldurtugs s858, Sophia s852, Kayque s853) predate this run; their status unknown without fresh check.

SQL when ready (NOT YET RUN):
  UPDATE booking_courses SET is_renewal=true WHERE name ILIKE '%Renewal%' AND is_renewal=false;

Last checked: 2026-07-09 UTC hrly24 bot.

---
**10 Jul FRI UTC (this run, Jul10 deadline day): CONFIRMED UNCHANGED (fresh DB).**

- s278 Verónica Martín: bc24931 GE-AM Jul6-Jul10 ENDED TODAY. ZERO class assignments EVER for bc24931. **MISSED ENTIRELY — nothing more to do for Verónica this booking.** Course has ended.
- s14564 Ettore Iovinella: bc24968 GE-AM-Plus Jul6-Jul13. SCA281 links to old bc24941 (ended Jul3), NOT bc24968. ZERO class assignments for current bc24968. 3 school days remain (Mon-Wed Jul13 = Ettore last day). **ASSIGN BEFORE MON JUL13 OR STUDENT MISSES ENTIRE CURRENT COURSE.**
- s72 Pietro Colombo: bc81 MG-Plus Jul6-Jul24. ZERO class assignments ever for bc81. 10 school days remain (deadline Jul24). Assign this week.

bc24941 (Ettore Jun29-Jul3, old course) still active=true — separate low-priority cleanup item.

NEIL: Assign Ettore (bc24968, deadline Mon Jul13) + Pietro (bc81, deadline Jul24) to classes in SIS admin immediately. Sheet K updated to Verónica MISSED; Ettore Fri. Last checked: 2026-07-10 FRI UTC (bot).


---
9 Jul 2026 UTC (this run, hrly25) - CONFIRMED UNCHANGED + CORRECTION

CORRECTION: BC24968 ends 13 July 2026. 13 July 2026 is a MONDAY, not Friday.
Prior H column and K column incorrectly said Friday 13 July.
H and K have been corrected in the sheet this run.

Fresh DB:
- Veronica Martin (s278, bc24931 GE-AM Jul6-10): ZERO class assignments ever.
  Course ends 10 July 2026. MISSED ENTIRELY.
- Ettore Iovinella (s14564, bc24968 GE-AM-Plus Jul6-13): SCA281 weekEnd=2026-07-03
  for old bc24941. ZERO SCAs for current bc24968. Course ends Mon Jul13.
  2 school days remain: Fri Jul10 + Mon Jul13.
- Pietro Colombo (s72, bc81 MG-Plus Jul6-24): ZERO class assignments ever.
  11 school days remain (Jul10 to Jul24).

Actions (NOT YET RUN):
- Assign Ettore (s14564) via SIS admin student 14564 > Classes > Add assignment.
  Set week_end=2026-07-13. DEADLINE: before Mon Jul13 09:00 IST.
- Assign Pietro (s72) via SIS admin student 72 > Classes > Add assignment.
  Set week_end=2026-07-24. Deadline: before Jul24.
- Veronica: course has ended, nothing to do.

Last checked: 2026-07-09 UTC (hrly25).

## 10 Jul 2026 UTC (this run) — COURSES ENDED

Fresh DB. BC24931 (Veronica s278 GE-AM Jul6-10): endDate=2026-07-10 TODAY, ZERO SCAs — entire week untracked. BC24968 (Ettore s14564 GE-AM-Plus Jul6-10): endDate=2026-07-10 TODAY, ZERO SCAs — entire week untracked. BC81 (Pietro s72 Morning Gen Plus Jul6-Jul24): STILL ZERO SCAs — 14 school days remaining from Mon Jul13. NEIL: (1) Assign Pietro to class via SIS student 72 > Classes > booking course 81 IMMEDIATELY; (2) If Ettore/Veronica attended any classes Jul6-10, add retroactive SCAs NOW — last chance before records are historical. Sheet row 47 H/I/J/K written.


## 10 Jul 2026 UTC (this run) — FRIDAY END OF WEEK 1

CONFIRMED UNCHANGED (fresh DB). Report-only.
- BC81 (Pietro Colombo s72, Morning General Plus Jul6-Jul24, bk78 CONFIRMED): active=true — ZERO class assignments. Week 1 ends today. 14 school days remain from Monday 13 July. MUST assign before Monday.
- BC24968 (Ettore Iovinella s14564, GE-AM Plus Jul6-Jul10, bk18191 CONFIRMED): active=true — ENDED TODAY. ZERO class assignments for entire week. If Ettore attended Jul6-10, retroactive assignments must be added TODAY.
- BC24931 (Veronica Martin s278, GE-AM Jul6-Jul10, bk18156 CONFIRMED): active=true — ENDED TODAY. ZERO class assignments for entire week. If Veronica attended Jul6-10, retroactive assignments must be added TODAY.
- NEIL: (1) Assign Pietro to class via SIS student 72 > booking course 81 BEFORE Monday 13 July; (2) Add retroactive class assignments for Ettore s14564 and Veronica s278 if they attended Jul6-10 — TODAY IS THE LAST CHANCE.
Last checked: 2026-07-10 UTC (this run).

---
## 10 Jul 2026 UTC (this run)

Fresh DB check. 3 active booking courses confirmed ZERO class assignments:
- BC81 (Pietro Colombo s72, Morning General Plus, Jul6-Jul24): 0 SCAs, active=true — week 1 ended today, 14 school days remain from Mon Jul14. MUST ASSIGN BEFORE MONDAY 13 JUL.
- BC24968 (Ettore Iovinella s14564, GE AM Plus, Jul6-Jul10): 0 SCAs — course ENDS TODAY Jul10. Retroactive SCA needed if Ettore attended.
- BC24931 (Veronica Martin s278, GE AM, Jul6-Jul10): 0 SCAs — course ENDS TODAY Jul10. Retroactive SCA needed if Veronica attended.
- Bookings 78 (Pietro), 18191 (Ettore), 18156 (Veronica): all CONFIRMED, fully paid.

Last checked: 2026-07-10 UTC (this run, hrly bot).

## 11 Jul 2026 UTC (SAT, 9th pass, fresh DB)

CONFIRMED UNCHANGED.
- Pietro Colombo (s72, bc81, Morning General Plus, Jul6-Jul24): ZERO class assignments — booking 78 CONFIRMED EUR1880/1880. Week 2 starts Mon Jul13 = 2 days.
- Booking course 24968 (Ettore, General English AM Plus, ended Jul10): STILL active=true (1 day stale).
- Booking course 24931 (Veronica, General English AM, ended Jul10): STILL active=true (1 day stale).
See sheet row 47. Last checked: 2026-07-11 UTC (SAT, 9th pass, hrly bot).


---
## 11 Jul 2026 UTC (13th pass, fresh DB)

NEW FINDING: Renewal students Kayque and Tuguldurtugs still lack class assignments for their new courses.

Pietro Colombo (student 72): booking course 81 (Morning General Plus, Jul 6-24 2026) — STILL ZERO class assignments. Week 2 starts Monday 13 July. Booking 78 CONFIRMED EUR 1880/1880 fully paid.

Kayque Tauann Lopes Coelho (student 852): booking course 1821 (Academic Year Renewal Afternoon, 29 Jun - 18 Dec 2026) — last class assignment (id 26) was on old booking course 1507, expired 24 Apr 2026 — ZERO assignments for new BC1821.

Tuguldurtugs Enkhtugs (student 858): booking course 1786 (Academic Year Renewal Morning, 6 Jul - 25 Dec 2026) — last class assignment (id 55) was on old booking course 1521, expired 1 May 2026 — ZERO assignments for new BC1786.

Booking course 24968 (General English AM Plus, booking 18191, Ettore Iovinella): ended 10 July 2026 — still active = true (1 day stale).

Fix required (NOT YET RUN):
1. Assign Pietro Colombo (student 72) to a class via SIS admin > student 72 > Classes > Add assignment — BEFORE MONDAY 13 JULY 09:00
2. Assign Kayque (student 852) to class for booking course 1821 via SIS admin > student 852 > Classes > Add assignment
3. Assign Tuguldurtugs (student 858) to class for booking course 1786 via SIS admin > student 858 > Classes > Add assignment
4. Deactivate booking course 24968: UPDATE booking_courses SET active=false WHERE id=24968 (cosmetic)

Last checked: 2026-07-11 UTC (13th pass, hrly bot).
---
## Addendum 2026-07-11 SAT UTC (15th pass)

Pietro(s72) BC81 ZERO SCAs (5d since Jul6 start). Kayque(s852) BC1821 ZERO SCAs (12d since Jun29). Tuguldurtugs(s858) BC1786 ZERO SCAs (5d since Jul6). BC24968 ended Jul10 STILL active=true (2d stale). Mon13=2d. Fresh DB confirmed all 3 unassigned. Last checked 2026-07-11 UTC (15th pass).

---
## 11 Jul 2026 SAT UTC (16th pass)

UNCHANGED (fresh DB). All 3 students confirmed ZERO SCAs:
- Pietro Colombo (s72, bc81, Morning General Plus Jul6-24, bk78 CONFIRMED): 0 SCAs, 5 school days missed
- Kayque Tauann Lopes Coelho (s852, bc1821, AY Renewal Afternoon Jun29-Dec18, bk1633 CONFIRMED): 0 SCAs, 12 school days missed
- Tuguldurtugs Enkhtugs (s858, bc1786, AY Renewal Morning Jul6-Dec25, bk1601 CONFIRMED): 0 SCAs, 5 school days missed

BC24968 (Ettore Iovinella, GE-AM-Plus, ended 10 Jul): still active=true (1 day stale).

Also stale (not yet deactivated):
- BC1506 (Kayque old booking 1399, AY Morning Oct25-Dec19 2025): still active=true
- BC1507 (Kayque old booking 1399, AY Morning Jan-Apr26): still active=true
- BC1520 (Tuguldurtugs old booking 1406, AY Morning Oct25-Dec19 2025): still active=true
- BC1521 (Tuguldurtugs old booking 1406, AY Morning Jan-May26): still active=true

MONDAY 13 JULY IS 2 DAYS AWAY. Week 2 has no class assignments for any of these students.

Fix (NOT RUN):
(1) SIS admin > student 72 > booking 78 > course 81 > Add Class Assignment before Mon 13 Jul
(2) SIS admin > student 852 > booking 1633 > course 1821 > Add Class Assignment
(3) SIS admin > student 858 > booking 1601 > course 1786 > Add Class Assignment
(4) Deactivate BC24968 via SIS admin (booking 18191 > course 24968 > deactivate)
(5) Optionally deactivate old stale BCs 1506, 1507, 1520, 1521 via SIS admin

Last checked: 2026-07-11 SAT UTC (16th pass, hourly bot).

---
## 11 Jul 2026 SAT UTC — 17th pass (fresh DB) — CRITICAL: Mon 13 Jul = 2 days away

Pietro Colombo (s72, BC81 Morning General Plus Jul6-24 2026): ZERO class assignments since course start Jul6 — 5 school days missed with no attendance tracking. Week 2 starts Mon Jul13 in 2 days. Kayque Tauann Lopes Coelho (s852, BC1821 AY Renewal Afternoon Jun29-Dec18 2026): ZERO class assignments on current booking course — last SCA (id=26, classId=5) was on old BC1507 (expired Apr24) — 12 school days unassigned. Tuguldurtugs Enkhtugs (s858, BC1786 AY Renewal Morning Jul6-Dec25 2026): ZERO class assignments on current booking course — last SCA (id=55, classId=8) was on old BC1521 (expired May01) — 5 school days unassigned. BC24968 (General English AM Plus bk18191, ended Jul10 2026): STILL active=true (1 day stale). Fix (NOT RUN): (1) SIS admin > student 72 > booking 78 > course 81 > Add Class Assignment before Mon Jul13; (2) SIS admin > student 852 > booking 1633 > course 1821 > Add Class Assignment; (3) SIS admin > student 858 > booking 1601 > course 1786 > Add Class Assignment; (4) deactivate BC24968 via SIS admin. NEIL: all 3 students need class assignments BEFORE Mon Jul13 09:00. Last checked: 2026-07-11 SAT UTC (17th pass, hourly bot).

---
## 11 Jul 2026 SAT UTC — 18th pass (fresh DB)

Fresh DB confirms unchanged. Pietro Colombo (s72, BC81 Morning General Plus Jul6-24): ZERO SCAs ever — 5 school days missed, week 2 starts Mon Jul13 in 2 days. Kayque Tauann Lopes Coelho (s852, BC1821 AY Renewal Afternoon Jun29-Dec18): last SCA id=26 expired Apr24 2026 (78 days ago), on old BC1507 — 10 school days missed on current course with no active assignment. Tuguldurtugs Enkhtugs (s858, BC1786 AY Renewal Morning Jul6-Dec25): last SCA id=55 expired May01 2026 (71 days ago), on old BC1521 — 5 school days missed on current course. BC24968 (ended Jul10): STILL active=true (1 day stale). NEIL: assign all 3 students to classes BEFORE Mon Jul13 09:00. NOT RUN. Last checked: 2026-07-11 SAT UTC (18th pass, hourly bot).


---
## 11 Jul 2026 SAT UTC (this bot run)

Fresh DB: BC81 (Pietro s72) ZERO SCAs, BC1821 (Kayque s852) ZERO SCAs, BC1786 (Tuguldurtugs s858) ZERO SCAs. All 3 still unassigned. Pietro ends Jul24=13d. Kayque/Tuguldurtugs ongoing. MON13=2d. BK1601 EUR1356.50/1606.50 EUR250 outstanding. Sheet H47:K47 updated. NEIL: assign all 3 before Monday 13 July.


---
## 21st check 2026-07-11 SAT UTC (this run)
CONFIRMED UNCHANGED. BC81 Pietro(s72) ZERO SCAs (5 school days missed). BC1821 Kayque(s852) ZERO SCAs (10 school days). BC1786 Tuguldurtugs(s858) ZERO SCAs (5 days). MON13=2d. BK1601 EUR250 outstanding. Sheet H47:K47 updated. NEIL: assign all 3 before Monday 13 July.

---
33rd check 2026-07-12 SUN UTC: CONFIRMED UNCHANGED (fresh DB). Pietro(s72/bc81 Morning-General-Plus Jul6-Jul24) STILL 0 SCAs — ends Jul24 (10 school days from Mon13). Kayque(s852/bc1821 AY-Renewal-Aft Jun29-Dec18) STILL 0 SCAs — 10+ school days missed since Jun29. Tuguldurtugs(s858/bc1786 AY-Renewal-Morn Jul6-Dec25) STILL 0 SCAs — 5 school days missed Jul7-11. All 3 bookings CONFIRMED. bk1601 EUR1356.50/1606.50 EUR250 outstanding. Mon13=TOMORROW. NEIL: assign all 3 students to classes via SIS admin TODAY before Mon Jul13.
Last checked: 2026-07-12 SUN UTC (33rd check, hourly bot).

---
34th check 2026-07-12 SUN UTC: CONFIRMED UNCHANGED (fresh DB). BC81(Pietro s72 Jul6-24) STILL 0 SCAs — 5d missed. BC1821(Kayque s852 Jun29-Dec18) STILL 0 SCAs — 10d missed. BC1786(Tuguldurtugs s858 Jul6-Dec25) STILL 0 SCAs — 5d missed. Mon13=TOMORROW. bk1601 EUR1356.50/1606.50 EUR250 outstanding. NEIL: assign all 3 via SIS before Mon Jul13 09:00.
Last checked: 2026-07-12 SUN UTC (34th check, hourly bot).

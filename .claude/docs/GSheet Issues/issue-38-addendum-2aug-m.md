Issue 38 -- Aug Bank Holiday 2026 (66th check -- CRITICAL: BH TOMORROW)
Reporter: PG | Area: Holidays/Bookings | Sheet row 40

Root Cause (Sun 2 Aug 2026 UTC, 66th check, 1st this hour)
- school_closures confirmed: NO record for 2026-08-03. Next is Christmas 2026 (id=7).
- 21 active booking_courses have start_date 2026-08-03, ALL with 0 class assignments.
- Bank Holiday is TOMORROW (Mon 3 Aug). All 21 BCs must shunt to Aug 4.

All 21 affected BCs (active, 0 SCAs):
BC 88    Morning General           bk 82    Africa Mera Bachir
BC 97    Academic Year Morning      bk 89    Gustavo Ferreira PENDING UNCONF
BC 1755  Morning General           bk 1571  Maria Giulia Serpi
BC 1766  AY Renewal Morning        bk 1581  Maria Eduarda Alves Paiva
BC 24627 Morning General           bk 17853 Angelica Guerin CONFIRMED UNCONF
BC 24908 General English AM        bk 18128 Ai Tsunashima
BC 24956 General English AM        bk 18180 Giampaolo Russo (see Issue 41)
BC 24958 AY Morning                bk 18182 Aurora Madril Oliveira Molina
BC 24959 AY Morning                bk 18183 Diego Alves da Silva Molina
BC 24964 General English AM Plus   bk 18188 Luana Salzano
BC 24984 Intensive                 bk 18207 Deva Sofia Onorato
BC 24999 General English PM        bk 18222 Soumaya Bourguiba PENDING UNCONF
BC 25002 General English AM        bk 18225 Aleix Cervera Gonzalez
BC 25003 General English AM        bk 18225 Aleix Cervera Gonzalez [DUPLICATE -- deactivate]
BC 25010 General English AM        bk 18232 Alin Merticariu
BC 25016 Life Pass Morning         bk 18238 Anderson da Silva Martins
BC 25028 Intensive                 bk 18249 Edgar Gilabert Mata
BC 25029 AY Morning                bk 18250 Monica Breier Fiametti PENDING UNCONF
BC 25030 General English PM        bk 18251 Tayron Sanches Feijo Filho PARTIAL UNCONF
BC 25033 General English PM        bk 18254 Jingyi Yang PENDING UNCONF
BC 25035 General English AY        bk 17915 Rakan Alghamdi

Fix Recipe (NOT YET RUN)

Step 1 -- Insert Aug Bank Holiday
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at) VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2 -- Shunt 21 BCs from Aug 3 to Aug 4
UPDATE booking_courses SET start_date='2026-08-04', updated_at=NOW() WHERE start_date='2026-08-03' AND active=true;
Expected: 21 rows.

Step 3 -- Deactivate duplicate BC 25003 (BC 25002 is the keeper)
UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=25003;

Step 4 -- Create SCAs for all 21 students via SIS admin
Priority: Giampaolo Russo (BC 24956) and Alberto Squillace (BC 24686) before Tue 4 Aug.

Risk: Bookings + Attendance. Reversible. 21 students. ACTION NEEDED TODAY.
Status: NOT RUN. Last checked: Sun 2 Aug 2026 UTC (66th check, 16th today)
Issue 38 -- Aug Bank Holiday 2026 (67th check -- BH IS TOMORROW Mon 3 Aug)
Reporter: PG | Area: Holidays/Bookings | Sheet row 40

Root Cause (Sun 2 Aug 2026 UTC, 67th check, 17th today)
- school_closures: NO record for 2026-08-03. 9 total (Good Fridays + Christmases). Next: Christmas 2026-12-21.
- 21 active booking_courses have start_date 2026-08-03, ALL with 0 class assignments.
- Bank Holiday is TOMORROW (Mon 3 Aug 2026). All 21 BCs must shunt to Aug 4.
- DUPLICATE BCs on booking 18225 (Aleix Cervera Gonzalez): BC 25002 AND BC 25003 both active,
  both startDate=2026-08-03, endDate=2026-09-18, name=General English AM.
  Deactivate BC 25003 BEFORE running the shunt (Step 1 below).

All 21 affected BCs (active, 0 SCAs):
BC 88    Morning General           bk 82    Africa Mera Bachir
BC 97    Academic Year Morning      bk 89    Gustavo Ferreira PENDING UNCONF
BC 1755  Morning General           bk 1571  Maria Giulia Serpi
BC 1766  AY Renewal Morning        bk 1581  Maria Eduarda Alves Paiva
BC 24627 Morning General           bk 17853 Angelica Guerin CONFIRMED UNCONF
BC 24908 General English AM        bk 18128 Ai Tsunashima
BC 24956 General English AM        bk 18180 Giampaolo Russo (Issue 41)
BC 24958 AY Morning                bk 18182 Aurora Madril Oliveira Molina
BC 24959 AY Morning                bk 18183 Diego Alves da Silva Molina
BC 24964 General English AM Plus   bk 18188 Luana Salzano
BC 24984 Intensive                 bk 18207 Deva Sofia Onorato
BC 24999 General English PM        bk 18222 Soumaya Bourguiba PENDING UNCONF
BC 25002 General English AM        bk 18225 Aleix Cervera Gonzalez [KEEP - deactivate 25003]
BC 25003 General English AM        bk 18225 Aleix Cervera Gonzalez [DUPLICATE - deactivate]
BC 25010 General English AM        bk 18232 Alin Merticariu
BC 25016 Life Pass Morning         bk 18238 Anderson da Silva Martins
BC 25028 Intensive                 bk 18249 Edgar Gilabert Mata
BC 25029 AY Morning                bk 18250 Monica Breier Fiametti PENDING UNCONF
BC 25030 General English PM        bk 18251 Tayron Sanches Feijo Filho PARTIAL UNCONF
BC 25033 General English PM        bk 18254 Jingyi Yang PENDING UNCONF
BC 25035 General English AY        bk 17915 Rakan Alghamdi

Fix Recipe (NOT YET RUN)

Step 1 -- Deactivate duplicate BC 25003 first
UPDATE booking_course SET active=false, updated_at=NOW() WHERE id=25003;
Verify: SELECT id,active FROM booking_course WHERE booking_id=18225;

Step 2 -- Insert Aug Bank Holiday into school_closures
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at, updated_at)
VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW(), NOW());

Step 3 -- Shunt 20 remaining active BCs from Aug 3 to Aug 4
Verify first: SELECT count(*) FROM booking_course WHERE start_date='2026-08-03' AND active=true;
Expected: 20 (after Step 1 deactivates BC 25003).
UPDATE booking_course SET start_date='2026-08-04', updated_at=NOW()
WHERE start_date='2026-08-03' AND active=true;

Step 4 -- Create SCAs for all 20 shunted BCs via SIS admin
All 20 BCs need SCA for week beginning Mon 4 Aug 2026.
Priority: BC 24956 (Giampaolo, Issue 41) before Tue 4 Aug.

Risk: Bookings + Attendance. Reversible. 21 students (20 after dedup). ACTION NEEDED TODAY.
Status: NOT RUN. Last checked: Sun 2 Aug 2026 UTC (67th check, 17th today)

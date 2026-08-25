== Issue 38 - Aug Bank Holiday 2026-08-03 (DEADLINE TOMORROW FRI 31 JUL)
Reporter: Neil / Staff | Area: Holidays, Bookings | Sheet row: 40

-- Symptom
Aug Bank Holiday (Mon 2026-08-03) absent from school_closures.
19 active BCs start 2026-08-03, must be shunted to 2026-08-04 before Monday.

-- Root Cause (Thu 30 Jul 2026 UTC - 3rd check)
- school_closures: NO record for 2026-08-03. Next closure: Christmas 2026-12-21.
- booking_courses start_date=2026-08-03 AND active=true: 19 rows (was 20; BC24970 gone).
- Fix NOT RUN. DEADLINE: TOMORROW Fri 31 Jul 2026.

-- 19 Affected BCs
BC88    Africa Mera Bachir              Morning General           bk82
BC97    Gustavo Ferreira                AY Morning                bk89
BC1755  Maria Giulia Serpi              Morning General           bk1571
BC1766  Maria Eduarda Alves Paiva       AY Renewal Morning        bk1581
BC24627 Angelica Guerin                 Morning General           bk17853
BC24908 Ai Tsunashima                   General English AM        bk18128
BC24956 Giampaolo Russo                 General English AM        bk18180 (also issue 41)
BC24958 Aurora Madril Oliveira Molina   AY Morning                bk18182
BC24959 Diego Alves da Silva Molina     AY Morning                bk18183
BC24964 Luana Salzano                   General English AM Plus   bk18188
BC24984 Deva Sofia Onorato              Intensive GE + IELTS      bk18207
BC24999 Soumaya Bourguiba               General English PM        bk18222
BC25002 Aleix Cervera Gonzalez          General English AM        bk18225
BC25003 Aleix Cervera Gonzalez          General English AM        bk18225 (dup)
BC25010 Alin Merticariu                 General English AM        bk18232
BC25016 Anderson da Silva Martins       Life Pass Morning         bk18238
BC25028 Edgar Gilabert Mata             Intensive General English  bk18249
BC25029 Monica Breier Fiametti          AY Morning                bk18250
BC25030 Tayron Sanches Feijo Filho      General English PM        bk18251

-- Fix Recipe (NOT YET RUN)

Step 1 - Insert Aug Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2 - Check Aleix dup (BC25002 + BC25003 on bk18225):
  SELECT id, name, start_date, end_date FROM booking_courses WHERE booking_id=18225;
  Deactivate wrong one.

Step 3 - Shunt 19 BCs to 2026-08-04:
  UPDATE booking_courses SET start_date='2026-08-04' WHERE start_date='2026-08-03' AND active=true;

Step 4 - Verify:
  SELECT COUNT(*) FROM booking_courses WHERE start_date='2026-08-03' AND active=true; -- expect 0
  SELECT * FROM school_closures WHERE start_date='2026-08-03'; -- expect 1 row

-- Risk
Reversible. Blast: 19 BCs ~18 students. Deadline TOMORROW Fri 31 Jul.

-- Status
OPEN - URGENT - fix NOT RUN (3rd check Thu 30 Jul 2026 UTC)
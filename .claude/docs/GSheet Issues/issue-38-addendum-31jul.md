Issue 38 Addendum 31jul (11th check Fri 31 Jul 2026 UTC)

Reporter: PG | Area: Holidays/Bookings | Sheet row: 40

Root Cause
- school_closures has NO entry for 2026-08-03 (confirmed: 0 closures in Jul-Sep 2026).
- 20 active booking courses still have start_date = 2026-08-03 (unchanged).
  IDs: 88,97,1755,1766,24627,24908,24956,24958,24959,24964,24984,24999,25002,25003,25010,25016,25028,25029,25030,25033
  Students: Africa Mera Bachir, Gustavo Ferreira, Maria Giulia Serpi, Maria Eduarda Alves Paiva, Angelica Guerin, Ai Tsunashima, Giampaolo Russo, Aurora Madril Oliveira Molina, Diego Alves da Silva Molina, Luana Salzano, Deva Sofia Onorato, Soumaya Bourguiba, Aleix Cervera Gonzalez (x2), Alin Merticariu, Anderson da Silva Martins, Edgar Gilabert Mata, Monica Breier Fiametti, Tayron Sanches Feijo Filho, Jingyi Yang
- BC 25006 (Marina Larripa, General English AM Plus): end = 2026-08-03 — last teaching day is BH.
- Fix NOT RUN.

DEADLINE: TODAY Fri 31 Jul 2026. Students arrive Sat-Sun 1-2 Aug. First class Mon 3 Aug (Bank Holiday).

Fix Recipe (NOT YET RUN)

Step 1 — Insert Aug Bank Holiday closure:
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'School closed', true, NOW());
  Verify: SELECT id, name, start_date FROM school_closures WHERE start_date = '2026-08-03'; -- expect 1 row

Step 2 — Shunt 20 BC start_dates from Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04', updated_at = NOW()
  WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24984,24999,25002,25003,25010,25016,25028,25029,25030,25033)
    AND active = true AND start_date = '2026-08-03';
  Verify: SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true; -- expect 0

Step 3 — Push BC 25006 end_date from Aug 3 to Aug 4:
  UPDATE booking_courses SET end_date = '2026-08-04', updated_at = NOW()
  WHERE id = 25006 AND end_date = '2026-08-03';
  Verify: SELECT id, start_date, end_date FROM booking_courses WHERE id = 25006;

Risk: Bookings/Holidays — reversible. Blast radius: 21 course records.
Status: NOT RUN. 11th check Fri 31 Jul 2026 UTC. DEADLINE TODAY.
Last checked: 2026-07-31 UTC.

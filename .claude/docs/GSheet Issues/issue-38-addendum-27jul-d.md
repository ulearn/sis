Issue 38 -- Aug Bank Holiday Missing (127th run, Mon 27 Jul 2026 UTC)
Reporter: PG | Area: Holidays / Bookings | Sheet row: 40

SYMPTOM
Aug 3 2026 is Bank Holiday Monday. 17 active booking courses start on that date.

ROOT CAUSE (fresh DB Mon 27 Jul UTC -- 127th check)
school_closures: 9 entries only (Good Fridays 2026-2030, Christmas 2026-2029).
Aug Bank Holiday 2026-08-03 is ABSENT -- auto-shunt cannot trigger.
17 BCs with start_date=2026-08-03 and active=true confirmed by live query (unchanged).

Affected BC IDs: 88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25003, 25010, 25016
Students: Africa Mera Bachir, Gustavo Ferreira, Maria Giulia Serpi, Maria Eduarda Alves Paiva, Angelica Guerin,
  Ai Tsunashima, Giampaolo Russo, Aurora Madril Oliveira Molina, Diego Alves da Silva Molina, Luana Salzano,
  Tsengelbayar Mendsaikhan, Deva Sofia Onorato, Soumaya Bourguiba, Aleix Cervera Gonzalez (x2), Alin Merticariu, Anderson da Silva Martins

FIX RECIPE (NOT YET RUN)

DEADLINE: Fri 31 Jul 2026 -- 4 working days from Mon 27 Jul

Step 1 -- Insert Aug Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true);
  Verify: SELECT * FROM school_closures WHERE start_date = '2026-08-03';

Step 2 -- Shunt 17 BCs from Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04'
  WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25003,25010,25016)
  AND start_date = '2026-08-03';

Step 3 -- Verify no SCAs have weekStart=Aug 3 on affected BCs (most have 0 SCAs).

RISK / CATEGORY
Category: Bookings/school operations | Reversible: Yes | Blast radius: 17 students

STATUS: OPEN -- Fix NOT RUN | Last checked: Mon 27 Jul 2026 UTC (127th hrly)
# Issue 38 -- August Bank Holiday 2026-08-03 (addendum 2 Aug d)

Reporter: Neil/Adrian  Area: Holidays, Bookings  Sheet row: 40

## Symptom
Course start dates on Bank Holiday (Mon 3 Aug 2026) must shunt to Tue 4 Aug.

## Root cause (57th check Sun 2 Aug 2026 UTC)

- school_closures: NO entry for 2026-08-03. Most recent entry: Good Friday 2026-04-03.
- 21 active booking courses have start_date = 2026-08-03 (unchanged across all 7 checks today).
- Window: school opens ~09:00 WEST Mon 3 Aug = ~08:00 UTC.

BCs on Aug 3 (first 12 of 21):
  BC 88    Morning General             BK 82    Africa Mera Bachir
  BC 1766  AY Renewal Morning          BK 1581  Maria Eduarda Alves Paiva
  BC 1755  Morning General             BK 1571  Maria Giulia Serpi
  BC 24627 Morning General             BK 17853 Angelica Guerin
  BC 97    AY Morning                  BK 89    Gustavo Ferreira
  BC 24908 General English AM          BK 18128 Ai Tsunashima
  BC 24964 General English AM Plus     BK 18188 Luana Salzano
  BC 24958 AY Morning                  BK 18182 Aurora Madril Oliveira Molina
  BC 24956 General English AM          BK 18180 Giampaolo Russo (Issue 41)
  BC 24959 AY Morning                  BK 18183 Diego Alves da Silva Molina
  BC 24984 Intensive General English   BK 18207 Deva Sofia Onorato
  BC 24999 General English PM          BK 18222 Soumaya Bourguiba
  (9 more -- run Step 1 query to get complete list)

BC 25003 (Aleix Cervera Gonzalez, BK 18225): confirmed duplicate, 0 SCAs -- deactivate, do NOT shunt.

## Fix recipe (NOT YET RUN)

Step 1 -- Get full list:
  SELECT id, name, booking_id FROM booking_courses
  WHERE start_date = '2026-08-03' AND active = true ORDER BY id;

Step 2 -- Insert Aug Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', TRUE);

Step 3 -- Shunt 20 BCs (exclude BC 25003):
  UPDATE booking_courses SET start_date = '2026-08-04'
  WHERE start_date = '2026-08-03' AND active = true AND id != 25003;

Step 4 -- Deactivate BC 25003:
  UPDATE booking_courses SET active = false WHERE id = 25003;

Step 5 -- Verify:
  SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true;
  -- Must be 0
  SELECT * FROM school_closures WHERE start_date = '2026-08-03';
  -- Must show 1 row: August Bank Holiday

## Risk
Category: bookings. Reversible: yes. Blast radius: 20 students + 1 closure row.
TIME CRITICAL -- must run before ~08:00 UTC Mon 3 Aug 2026.

## Status
OPEN. Fix NOT RUN. Last checked: Sun 2 Aug 2026 UTC (57th check)
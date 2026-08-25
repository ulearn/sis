# Issue 38 — Aug Bank Holiday 2026-08-03 (URGENT — DEADLINE FRI 31 JUL)
Reporter: Neil / Staff  |  Area: Holidays, Bookings  |  Sheet row: 40

## Symptom
Aug Bank Holiday 2026-08-03 absent from school_closures. 20 active BCs start Mon 3 Aug and must shift to Tue 4 Aug.

## Root cause (Thu 30 Jul 2026 UTC)
- school_closures: 9 entries (Good Fridays 2026-2030, Christmases 2026-2029). NO August Bank Holiday.
- booking_courses WHERE start_date=2026-08-03 AND active=true: 20 rows confirmed.

## 20 Affected BCs (all start 2026-08-03, active=true)
BC88    Africa Mera Bachir              Morning General                bk82    CONFIRMED
BC97    Gustavo Ferreira                Academic Year Morning           bk89    PENDING
BC1755  Maria Giulia Serpi              Morning General                bk1571  CONFIRMED
BC1766  Maria Eduarda Alves Paiva       AY Renewal Morning             bk1581  CONFIRMED
BC24627 Angelica Guerin                 Morning General                bk17853 CONFIRMED
BC24908 Ai Tsunashima                   General English AM             bk18128 CONFIRMED
BC24956 Giampaolo Russo                 General English AM             bk18180 CONFIRMED
BC24958 Aurora Madril Oliveira Molina   Academic Year Morning          bk18182 CONFIRMED
BC24959 Diego Alves da Silva Molina     Academic Year Morning          bk18183 CONFIRMED
BC24964 Luana Salzano                   General English AM Plus        bk18188 CONFIRMED
BC24970 Tsengelbayar Mendsaikhan        Academic Year Afternoon        bk18194 PARTIAL
BC24984 Deva Sofia Onorato             Intensive GE + IELTS           bk18207 CONFIRMED
BC24999 Soumaya Bourguiba               General English PM             bk18222 PENDING
BC25002 Aleix Cervera Gonzalez          General English AM             bk18225 CONFIRMED
BC25003 Aleix Cervera Gonzalez          General English AM             bk18225 CONFIRMED (dup — review)
BC25010 Alin Merticariu                 General English AM             bk18232 PENDING
BC25016 Anderson da Silva Martins       Life Pass Morning              bk18238 CONFIRMED
BC25028 Edgar Gilabert Mata             Intensive General English      bk18249 PENDING
BC25029 Monica Breier Fiametti          Academic Year Morning          bk18250 PENDING
BC25030 Tayron Sanches Feijo Filho      General English PM             bk18251 PENDING

## Fix recipe (NOT YET RUN)

### Step 1 — add Aug Bank Holiday to school_closures
Run from sis/ directory:
  node --env-file=.env scripts/add-closure.js
OR direct query:
  INSERT INTO school_closures (name, start_date, end_date, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', NOW());

### Step 2 — shunt 20 BCs from 2026-08-03 to 2026-08-04
  UPDATE booking_courses SET start_date='2026-08-04'
  WHERE start_date='2026-08-03' AND active=true;
  -- Expected: 20 rows affected

### Step 3 — verify
  SELECT COUNT(*) FROM booking_courses WHERE start_date='2026-08-03' AND active=true;
  -- Should return 0
  SELECT COUNT(*) FROM booking_courses WHERE start_date='2026-08-04' AND active=true;
  SELECT * FROM school_closures WHERE start_date='2026-08-03';

## Risk / category
- Category: bookings + data — reversible
- Blast radius: 20 BCs, ~19 students (Aleix Cervera has 2 BCs — possible duplicate, check)
- Reversible: UPDATE back to Aug 3 if anything wrong
- Deadline: TOMORROW Fri 31 Jul 2026

## Status
OPEN — URGENT — fix NOT RUN
Last checked: Thu 30 Jul 2026 UTC
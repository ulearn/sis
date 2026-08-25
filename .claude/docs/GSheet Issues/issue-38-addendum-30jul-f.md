# Issue 38 — Aug Bank Holiday 2026-08-03 (DEADLINE TOMORROW FRI 31 JUL)
Reporter: Neil / Staff  |  Area: Holidays, Bookings  |  Sheet row: 40

## Symptom
August Bank Holiday (Mon 2026-08-03) absent from school_closures. 20 active booking courses
start on 2026-08-03 and must be shunted to 2026-08-04 before Mon morning.

## Root Cause (Thu 30 Jul 2026 UTC — 2nd check)
- school_closures: NO record for 2026-08-03. Next closure: Christmas 2026-12-21.
- booking_courses WHERE start_date=2026-08-03 AND active=true: 20 rows confirmed.
- Fix NOT RUN as of this check (2nd check Thu 30 Jul).
- NOTE: Earlier hourly run wrote J = "DEADLINE TODAY (Fri 31 Jul)" — error; today is Thu 30 Jul.

## 20 Affected Booking Courses
BC88    Africa Mera Bachir              Morning General                bk82
BC97    Gustavo Ferreira                Academic Year Morning           bk89
BC1755  Maria Giulia Serpi              Morning General                bk1571
BC1766  Maria Eduarda Alves Paiva       AY Renewal Morning             bk1581
BC24627 Angelica Guerin                 Morning General                bk17853
BC24908 Ai Tsunashima                   General English AM             bk18128
BC24956 Giampaolo Russo                 General English AM             bk18180 (see also issue 41)
BC24958 Aurora Madril Oliveira Molina   Academic Year Morning          bk18182
BC24959 Diego Alves da Silva Molina     Academic Year Morning          bk18183
BC24964 Luana Salzano                   General English AM Plus        bk18188
BC24970 Tsengelbayar Mendsaikhan        Academic Year Afternoon        bk18194
BC24984 Deva Sofia Onorato             Intensive GE + IELTS           bk18207
BC24999 Soumaya Bourguiba               General English PM             bk18222
BC25002 Aleix Cervera Gonzalez          General English AM             bk18225 (dup)
BC25003 Aleix Cervera Gonzalez          General English AM             bk18225 (dup — review)
BC25010 Alin Merticariu                 General English AM             bk18232
BC25016 Anderson da Silva Martins       Life Pass Morning              bk18238
BC25028 Edgar Gilabert Mata             Intensive General English      bk18249
BC25029 Monica Breier Fiametti          Academic Year Morning          bk18250
BC25030 Tayron Sanches Feijo Filho      General English PM             bk18251

## Fix Recipe (NOT YET RUN)

### Step 1 — Insert Aug Bank Holiday into school_closures
Run from sis/ with .env loaded:

  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true);

### Step 2 — Check Aleix Cervera Gonzalez duplicate (BC25002 + BC25003)
Both on booking 18225. Review if one is a data entry error:
  SELECT * FROM booking_courses WHERE booking_id=18225;
If duplicate, DELETE the incorrect one before running Step 3.

### Step 3 — Shunt 20 BCs: start_date 2026-08-03 to 2026-08-04
  UPDATE booking_courses SET start_date='2026-08-04'
  WHERE start_date='2026-08-03' AND active=true;
  -- Expected: 20 rows (or 19 if one Aleix BC deleted first)

### Step 4 — Verify
  SELECT COUNT(*) FROM booking_courses WHERE start_date='2026-08-03' AND active=true;
  -- Expected: 0
  SELECT COUNT(*) FROM booking_courses WHERE start_date='2026-08-04' AND active=true;
  SELECT * FROM school_closures WHERE start_date='2026-08-03';

## Risk / Category
- Category: bookings + closures — reversible
- Blast radius: 20 BCs, ~19 students
- Reversible: UPDATE back to 2026-08-03 and DELETE closure if wrong
- Deadline: TOMORROW Fri 31 Jul 2026

## Status
OPEN — URGENT — fix NOT RUN as of Thu 30 Jul 2026 UTC (2nd check)
Last checked: Thu 30 Jul 2026 UTC (~15:00 onwards)
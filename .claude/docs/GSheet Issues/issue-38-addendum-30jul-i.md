## Issue 38 — Aug Bank Holiday 2026 Shunt (URGENT)
Reporter: PG | Area: Holidays, Bookings | Sheet row: 40 | DEADLINE: Fri 31 Jul 2026

## Root cause (confirmed Thu 30 Jul 2026 UTC — 6th check)
- school_closures table: NO record for Aug 3 2026 (Bank Holiday Monday)
- Only 2026 closures in DB: Good Friday Apr 3, Christmas Dec 21
- 20 active booking_courses have start_date = 2026-08-03 (count increased from 19)
- 1 active booking_course ends 2026-08-03 (Marina Larripa, BC 25006) — loses 1 teaching day

### New since last check (5th to 6th check, Thu 30 Jul)
BC 25033 — Jingyi Yang (student 14608), booking 18254, PENDING, General English PM, Aug 3 to Aug 28

### Full list of 20 BCs starting 2026-08-03 (all must shunt to 2026-08-04)
BC 88     Morning General             — Africa Mera Bachir (bk 82, CONFIRMED)
BC 97     Academic Year Morning       — Gustavo Ferreira (bk 89, PENDING)
BC 1755   Morning General             — Maria Giulia Serpi (bk 1571, CONFIRMED)
BC 1766   AY Renewal Morning          — Maria Eduarda Alves Paiva (bk 1581, CONFIRMED)
BC 24627  Morning General             — Angelica Guerin (bk 17853, CONFIRMED)
BC 24908  General English AM          — Ai Tsunashima (bk 18128, CONFIRMED)
BC 24956  General English AM          — Giampaolo Russo (bk 18180, CONFIRMED) [also issue 41]
BC 24958  Academic Year Morning       — Aurora Madril Oliveira Molina (bk 18182, CONFIRMED) [also issue 8]
BC 24959  Academic Year Morning       — Diego Alves da Silva Molina (bk 18183, CONFIRMED) [also issue 8]
BC 24964  General English AM Plus     — Luana Salzano (bk 18188, CONFIRMED)
BC 24984  Intensive General English   — Deva Sofia Onorato (bk 18207, CONFIRMED)
BC 24999  General English PM          — Soumaya Bourguiba (bk 18222, PENDING)
BC 25002  General English AM          — Aleix Cervera Gonzalez (bk 18225, CONFIRMED)
BC 25003  General English AM          — Aleix Cervera Gonzalez (bk 18225, CONFIRMED) [2nd BC same booking]
BC 25010  General English AM          — Alin Merticariu (bk 18232, CONFIRMED)
BC 25016  Life Pass Morning           — Anderson da Silva Martins (bk 18238, CONFIRMED)
BC 25028  Intensive General English   — Edgar Gilabert Mata (bk 18249, CONFIRMED)
BC 25029  Academic Year Morning       — Monica Breier Fiametti (bk 18250, PENDING)
BC 25030  General English PM          — Tayron Sanches Feijo Filho (bk 18251, PENDING)
BC 25033  General English PM          — Jingyi Yang (bk 18254, PENDING)  <- NEW this check

### 1 BC ending 2026-08-03 (must extend end_date to 2026-08-04)
BC 25006  General English AM Plus — Marina Larripa (bk 18228, CONFIRMED), Jul 27 to Aug 3

## Fix recipe — NOT YET RUN

### Step 1: Insert Aug Bank Holiday school closure
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, note)
VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, 'Public holiday');
Expected: 1 row inserted

### Step 2: Shunt 20 BCs start_date to Aug 4
UPDATE booking_courses
SET start_date = '2026-08-04'
WHERE id IN (
  88, 97, 1755, 1766,
  24627, 24908, 24956, 24958, 24959, 24964,
  24984, 24999, 25002, 25003, 25010, 25016,
  25028, 25029, 25030, 25033
)
AND start_date = '2026-08-03';
Expected: 20 rows affected

### Step 2b: Extend BC 25006 end_date
UPDATE booking_courses SET end_date = '2026-08-04' WHERE id = 25006 AND end_date = '2026-08-03';
Expected: 1 row affected

### Step 3: Verify
SELECT id, name, start_date, end_date FROM booking_courses
WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,
             24984,24999,25002,25003,25010,25016,25028,25029,25030,25033)
ORDER BY id;
-- All should show start_date = 2026-08-04
SELECT id, name, start_date, end_date FROM booking_courses WHERE id = 25006;
-- Should show end_date = 2026-08-04

## Risk
- Category: bookings — fully reversible (update start_date back if needed)
- Blast radius: 20 BCs across 19 students + 1 end_date fix
- If NOT done before Monday 3 Aug: students arrive expecting class; no class running

## Status
Fix NOT RUN. Deadline: before school opens Mon 4 Aug 2026 (Fri 31 Jul is last safe day).
Last checked: Thu 30 Jul 2026 UTC (6th check — count updated from 19 to 20, BC 25033 added)
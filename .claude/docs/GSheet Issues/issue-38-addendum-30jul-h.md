## Issue 38 — Aug Bank Holiday 2026 Shunt (URGENT)
Reporter: PG | Area: Holidays, Bookings | Sheet row: 40 | DEADLINE: Fri 31 Jul 2026

## Root cause (confirmed Thu 30 Jul 2026 UTC — 4th check)
- school_closures 2026: Good Friday (Apr 3) + Christmas (Dec 21) only. Aug 3 NOT present.
- 19 active booking_courses have start_date = 2026-08-03 (DB verified)

### 19 BCs starting 2026-08-03
BC88 Morning General — Africa Mera Bachir
BC97 AY Morning — Gustavo Ferreira
BC1755 Morning General — Maria Giulia Serpi
BC1766 AY Renewal Morning — Maria Eduarda Alves Paiva
BC24627 Morning General — Angelica Guerin
BC24908 General English AM — Ai Tsunashima
BC24956 General English AM — Giampaolo Russo
BC24958 AY Morning — Aurora Madril Oliveira Molina
BC24959 AY Morning — Diego Alves da Silva Molina
BC24964 General English AM Plus — Luana Salzano
BC24984 Intensive General English — Deva Sofia Onorato
BC24999 General English PM — Soumaya Bourguiba
BC25002 General English AM — Aleix Cervera Gonzalez
BC25003 General English AM — Aleix Cervera Gonzalez (2nd BC)
BC25010 General English AM — Alin Merticariu
BC25016 Life Pass Morning — Anderson da Silva Martins
BC25028 Intensive General English — Edgar Gilabert Mata
BC25029 AY Morning — Monica Breier Fiametti
BC25030 General English PM — Tayron Sanches Feijo Filho
Note: BC24970 gone since last check (deactivated/rescheduled).

## Fix recipe — NOT YET RUN

### Step 1: Insert school closure
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, note)
VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, 'Public holiday');

### Step 2: Shunt 19 BCs to Aug 4
UPDATE booking_courses SET start_date = 2026-08-04
WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,
             24984,24999,25002,25003,25010,25016,25028,25029,25030)
  AND start_date = 2026-08-03;
Expected: 19 rows affected

## Risk
Bookings — reversible; blast radius 19 BCs; no financial impact
If not done before Monday: students arrive with wrong timetable

## Status
Fix NOT RUN. Deadline: before school opens Mon 4 Aug 2026.
Last checked: Thu 30 Jul 2026 UTC

STEP 2b: Extend BC 25006 ending Aug 3 — NEW finding (5th check Thu 30 Jul UTC)
One active BC ENDS on 2026-08-03:
  BC 25006 General English AM Plus, 1 week Jul27-Aug3, Marina Larripa bk18228 conf=true
  Aug 3 is bank holiday: she gets 4 teaching days instead of 5
  Fix (NOT YET RUN): UPDATE booking_courses SET end_date=2026-08-04 WHERE id=25006 AND end_date=2026-08-03
  Expected: 1 row affected
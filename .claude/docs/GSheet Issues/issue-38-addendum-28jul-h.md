# Issue 38 - Aug Bank Holiday 2026 - 148th check Tue 28 Jul 2026 UTC

Reporter: Various | Area: Holidays / Bookings | Sheet row: 40

## Symptom
August Bank Holiday (Mon 3 Aug 2026) absent from school_closures. Now 20 active booking courses start on Aug 3. DEADLINE: Fri 31 Jul.

## Root cause (live DB, Tue 28 Jul 2026 ~15:00 UTC)
- school_closures: 9 entries (Good Fridays 2026-2030, Christmas 2026-2029) - Aug BH absent
- Active BCs with startDate 2026-08-03: 20 (was 19 in last recipe - BC 25030 added today)
- New BC: BC 25030 (Tayron Sanches Feijo Filho, booking 18251, General English PM, created 28 Jul 2026)
- Duplicate BCs 25002+25003 (Aleix Cervera Gonzalez, booking 18225): still both active

## Full BC list (20 BCs requiring action)
BC88 Africa Mera Bachir (bk82) | BC97 Gustavo Ferreira (bk89)
BC1755 Maria Giulia Serpi (bk1571) | BC1766 Maria Eduarda Alves Paiva (bk1581)
BC24627 Angelica Guerrin (bk17853) | BC24908 Ai Tsunashima (bk18128)
BC24956 Giampaolo Russo (bk18180) | BC24958 Aurora Madril Oliveira Molina (bk18182)
BC24959 Diego Alves da Silva Molina (bk18183) | BC24964 Luana Salzano (bk18188)
BC24970 Tsengelbayar Mendsaikhan (bk18194) | BC24984 Deva Sofia Onorato (bk18207)
BC24999 Soumaya Bourguiba (bk18222) | BC25002 Aleix Cervera Gonzalez (bk18225, keep)
BC25003 Aleix Cervera Gonzalez (bk18225, DEACTIVATE dup) | BC25010 Alin Merticariu (bk18232)
BC25016 Anderson da Silva Martins (bk18238) | BC25028 Edgar Gilabert Mata (bk18249)
BC25029 Monica Breier Fiametti (bk18250) | BC25030 Tayron Sanches Feijo Filho (bk18251, NEW)

## Fix recipe (NOT YET RUN)

Step 1 - Add Aug BH closure
SIS admin -> School Closures -> Add:
  Name: August Bank Holiday
  Start date: 2026-08-03, End date: 2026-08-03, isPaidHoliday: true

Step 2 - Shunt 19 BCs to Aug 4 (do NOT include BC 25003)
SQL (NOT YET RUN):
  UPDATE booking_courses SET start_date = '2026-08-04'
  WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25010,25016,25028,25029,25030)
  AND start_date = '2026-08-03';

Step 3 - Deactivate duplicate BC 25003
  UPDATE booking_courses SET active = false WHERE id = 25003;

## Risk
Category: bookings/holiday | Reversible: yes | Blast radius: 20 students will have incorrect course start date if not fixed by Fri

## Status
URGENT - FIX NOT RUN. DEADLINE Fri 31 Jul 2026 (3 days from Tue 28 Jul). Count: 20 BCs (up from 19).

Last checked: Tue 28 Jul 2026 ~15:00 UTC (148th hourly check)
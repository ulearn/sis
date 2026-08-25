# Issue 38 — Aug Bank Holiday 2026 (2 Aug 2026, check 65)

Reporter: AC | Area: Holidays/Bookings | Sheet row: 40

## Root Cause (65th check — 2 Aug 2026 UTC)
- school_closures: 9 records total. No Aug Bank Holiday entry.
- 21 active BCs start 2026-08-03 — unchanged across 65 checks.
- BC 25002 + BC 25003 (Aleix Cervera): BOTH active, BOTH have 0 SCAs. Deactivate BC 25003.
- Shunt target: 20 BCs (all Aug 3 starters except BC 25003).

BC list (21 starting Aug 3):
88 Morning General - Africa Mera Bachir
97 AY Morning - Gustavo Ferreira
1755 Morning General - Maria Giulia Serpi
1766 AY Renewal Morning - Maria Eduarda Alves Paiva
24627 Morning General - Angelica Guerin
24908 General English AM - Ai Tsunashima
24956 General English AM - Giampaolo Russo (Issue 41)
24958 AY Morning - Aurora Madril Oliveira Molina
24959 AY Morning - Diego Alves da Silva Molina
24964 General English AM Plus - Luana Salzano
24984 Intensive GE & IELTS - Deva Sofia Onorato
24999 General English PM - Soumaya Bourguiba
25002 General English AM - Aleix Cervera (KEEP)
25003 General English AM - Aleix Cervera (DEACTIVATE)
25010 General English AM - Alin Merticariu
25016 Life Pass Morning - Anderson da Silva Martins
25028 Intensive GE - Edgar Gilabert Mata
25029 AY Morning - Monica Breier Fiametti
25030 General English PM - Tayron Sanches Feijo Filho
25033 General English PM - Jingyi Yang
25035 GE AY AM Plus - Rakan Alghamdi

## Fix Recipe — NOT YET RUN

Step 1: Insert Aug BH closure:
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at) VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2: Deactivate BC 25003:
UPDATE booking_courses SET active = false WHERE id = 25003;

Step 3: Shunt 20 BCs to Aug 4:
UPDATE booking_courses SET start_date = 2026-08-04 WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24984,24999,25002,25010,25016,25028,25029,25030,25033,25035) AND start_date = 2026-08-03 AND active = true;
Verify count = 20 rows before committing.

Step 4: Verify 0 rows on Aug 3, 20 rows on Aug 4 in active booking_courses.

## Risk: bookings | Reversible | Blast radius: 20 students need SCAs from Tue 4 Aug
## Status: URGENT — BH IS TOMORROW (3 Aug 2026)
Last checked: 2 Aug 2026 UTC (check 65, 15th today)
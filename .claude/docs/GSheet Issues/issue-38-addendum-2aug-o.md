# Issue 38 — Aug Bank Holiday 2026 (68th check, 18th today)

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

## Symptom
August Bank Holiday 2026-08-03 absent from school_closures; 21 BCs start on that date.

## Root cause (confirmed Sun 2 Aug 2026 UTC, 18th check today)
- school_closures count for 2026-08-03 = 0 (confirmed)
- 21 active BCs start 2026-08-03, all 0 SCAs — unchanged
- Duplicate BC 25003 (Aleix Cervera Gonzalez, booking 18225) still active alongside BC 25002
- BC 25035 (Rakan Alghamdi/14444/bk17915, General English AY AM Plus, ends 2026-12-18): IN Aug3 list
  Check if this duplicates BC 24697 before shunting
- BH is TOMORROW (Mon 3 Aug)

## Full Aug 3 BC list (21 total, all active, 0 SCAs)
BC 88: Africa Mera Bachir (76) Morning General, end 07 Aug
BC 97: Gustavo Ferreira (83) AY Morning, end 18 Dec
BC 1755: Maria Giulia Serpi (1019) Morning General, end 14 Aug
BC 1766: Maria Eduarda Alves Paiva (1028) AY Renewal Morning, end 04 Sep
BC 24627: Angelica Guerin (14459) Morning General, end 14 Aug
BC 24908: Ai Tsunashima (14546) General English AM, end 21 Aug
BC 24956: Giampaolo Russo (14571) [Issue 41] General English AM, end 11 Sep
BC 24958: Aurora Madril Oliveira Molina (841) [Issue 8] AY Morning, end 05 Feb 2027
BC 24959: Diego Alves da Silva Molina (840) [Issue 8] AY Morning, end 05 Feb 2027
BC 24964: Luana Salzano (14576) General English AM Plus, end 14 Aug
BC 24984: Deva Sofia Onorato (14582) Intensive General English & IELTS, end 25 Aug
BC 24999: Soumaya Bourguiba (14594) General English PM, end 29 Aug
BC 25002: Aleix Cervera Gonzalez (14596) General English AM, end 18 Sep
BC 25003: DUPLICATE Aleix Cervera Gonzalez (14596) General English AM, end 18 Sep
BC 25010: Alin Merticariu (14601) General English AM, end 28 Aug
BC 25016: Anderson da Silva Martins (14607) Life Pass Morning, end 22 Jan 2027
BC 25028: Edgar Gilabert Mata (14615) Intensive General English, end 28 Aug
BC 25029: Monica Breier Fiametti (979) AY Morning, end 13 Nov
BC 25030: Tayron Sanches Feijo Filho (14616) General English PM, end 28 Aug
BC 25033: Jingyi Yang (14608) General English PM, end 28 Aug
BC 25035: Rakan Alghamdi (14444) [Issue 5] General English AY AM Plus, end 18 Dec

## Fix recipe (NOT YET RUN)

Step 1 — Deactivate duplicate BC 25003 (before shunt):
  UPDATE booking_courses SET active = false WHERE id = 25003;
  Verify: SELECT id, active FROM booking_courses WHERE booking_id = 18225;

Step 2 — Check Rakan BC 25035 vs 24697:
  SELECT id, name, start_date, end_date, active FROM booking_courses WHERE booking_id = 17915;
  If BC 24697 is still active, deactivate it (duplicate).

Step 3 — Insert Aug Bank Holiday into school_closures:
  INSERT INTO school_closures (created_at, name, start_date, end_date, note, is_paid_holiday)
  VALUES (NOW(), 'August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish Bank Holiday', false);
  Verify: SELECT * FROM school_closures WHERE start_date = '2026-08-03';

Step 4 — Shunt 20 remaining BCs from Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04' WHERE start_date = '2026-08-03' AND active = true;
  Verify: SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true; -- must be 0

Step 5 — Create SCAs for week starting Aug 4:
  For all 20 shunted BCs, assign to class via SIS admin (Classes > Assign, week Mon 3 Aug / Tue 4 Aug).
  Priority: BC 24956 (Giampaolo, arrived today), BC 24958+24959 (Aurora+Diego, Issue 8).
  BC 24686 (Alberto Squillace, Issue 24) starts Aug 3 only if shunt is needed — check separately.
  Note: BC 24686 starts 2026-07-20, not Aug 3 — Alberto is covered by a different recipe.

## Risk / category
Bookings + Classes; medium blast radius (20 students). Reversible. BH TOMORROW.

## Status: Fix NOT RUN — 68th check, 18th today Sun 2 Aug 2026 UTC
# Issue 38 — Aug Bank Holiday 2026 (71st check, 21st today)
Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

Symptom: Aug BH 2026-08-03 absent from school_closures; 21 BCs start that date.

Root cause (Sun 2 Aug 2026 UTC, 21st check today):
- school_closures has 9 entries only (Good Fridays + Christmas 2026-2030) — Aug BH STILL ABSENT
- 21 active booking courses start 2026-08-03, all 0 class assignments — unchanged from -p
- BC 25003 (Aleix Cervera Gonzalez, bk18225): duplicate still active alongside BC 25002
- BC 24697 (Rakan bk17915, AY Morning, Jul6-Jul31): ended 2 days ago, active=true — stale
- BC 25035 (Rakan bk17915, General English AY AM Plus, Aug3-Dec18): sequential, safe to shunt
- After deactivating BC 25003 + BC 24697: 19 BCs remain to shunt

NOTE: State unchanged from -p. Execute issue-38-addendum-2aug-p.md recipe NOW.

Aug 3 BC list (21 total; 19 after deactivations):
BC 88: Africa Mera Bachir (76) Morning General, end Aug7
BC 97: Gustavo Ferreira (83) AY Morning, end Dec18
BC 1755: Maria Giulia Serpi (1019) Morning General, end Aug14
BC 1766: Maria Eduarda Alves Paiva (1028) AY Renewal Morning, end Sep4
BC 24627: Angelica Guerin (14459) Morning General, end Aug14
BC 24908: Ai Tsunashima (14546) General English AM, end Aug21
BC 24956: Giampaolo Russo (14571) General English AM, end Sep11
BC 24958: Aurora Madril Oliveira Molina (841) AY Morning, end Feb2027
BC 24959: Diego Alves da Silva Molina (840) AY Morning, end Feb2027
BC 24964: Luana Salzano (14576) General English AM Plus, end Aug14
BC 24984: Deva Sofia Onorato (14582) Intensive General English & IELTS, end Aug25
BC 24999: Soumaya Bourguiba (14594) General English PM, end Aug29
BC 25002: Aleix Cervera Gonzalez (14596) General English AM, end Sep18 [KEEP]
BC 25003: DUPLICATE Aleix (14596) General English AM, end Sep18 [DEACTIVATE Step 1b]
BC 25010: Alin Merticariu (14601) General English AM, end Aug28
BC 25016: Anderson da Silva Martins (14607) Life Pass Morning, end Jan2027
BC 25028: Edgar Gilabert Mata (14615) Intensive General English, end Aug28
BC 25029: Monica Breier Fiametti (979) AY Morning, end Nov13
BC 25030: Tayron Sanches Feijo Filho (14616) General English PM, end Aug28
BC 25033: Jingyi Yang (14608) General English PM, end Aug28
BC 25035: Rakan Alghamdi (14444) General English AY AM Plus, end Dec18 [shunt]
Separate: BC 24697 Rakan AY Morning Jul6-Jul31 [2d stale, deactivate Step 1a, NOT in shunt]

Fix recipe (NOT YET RUN):

Step 1a — Deactivate stale BC 24697 (Rakan ended Jul31):
  UPDATE booking_courses SET active = false WHERE id = 24697;

Step 1b — Deactivate duplicate BC 25003:
  UPDATE booking_courses SET active = false WHERE id = 25003;
  Verify: SELECT id, active FROM booking_courses WHERE booking_id = 18225;

Step 2 — Insert August Bank Holiday:
  INSERT INTO school_closures (created_at, name, start_date, end_date, note, is_paid_holiday)
  VALUES (NOW(), 'August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish Bank Holiday', false);
  Verify: SELECT * FROM school_closures WHERE start_date = '2026-08-03';

Step 3 — Shunt 19 BCs from Aug3 to Aug4:
  UPDATE booking_courses SET start_date = '2026-08-04' WHERE start_date = '2026-08-03' AND active = true;
  Verify: SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true; -- must be 0

Step 4 — Create class assignments for week starting Tue 4 Aug (via SIS admin):
  Priority: BC 24956 (Giampaolo), BC 24958+24959 (Aurora+Diego), BC 25035 (Rakan).

Risk/category: Bookings + Classes; medium blast radius (19 students). Reversible. BH IS TOMORROW.
Status: NOT RUN — 71st check, 21st today Sun 2 Aug 2026 UTC

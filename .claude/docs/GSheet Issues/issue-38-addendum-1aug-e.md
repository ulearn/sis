# Issue 38 — August Bank Holiday 2026-08-03

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40 | Check: 40th (13th Sat 1 Aug 2026 UTC)

## Symptom
August Bank Holiday 2026-08-03 absent from school_closures; 21 active booking courses start on that date and have not been shunted to 2026-08-04.

## Root Cause (fresh DB — NOT YET FIXED)

school_closures: 9 entries — Good Fridays 2026-2030 and Christmas 2026-2029. No August Bank Holiday entry.

21 active booking courses start 2026-08-03:

Confirmed = true (15): BC 88 (Africa Mera Bachir), BC 1755 (Maria Giulia Serpi), BC 1766 (Maria Eduarda Alves Paiva), BC 24908 (Ai Tsunashima), BC 24956 (Giampaolo Russo Issue 41), BC 24958 (Aurora Madril Oliveira Molina), BC 24959 (Diego Alves da Silva Molina), BC 24964 (Luana Salzano), BC 24984 (Deva Sofia Onorato), BC 25002 (Aleix Cervera Gonzalez), BC 25003 (Aleix Cervera DUPLICATE of 25002), BC 25010 (Alin Merticariu), BC 25016 (Anderson da Silva Martins), BC 25028 (Edgar Gilabert Mata), BC 25035 (Rakan Alghamdi).

Confirmed = false/pending/partial (6): BC 97 (Gustavo Ferreira PENDING), BC 24627 (Angelica Guerin), BC 24999 (Soumaya Bourguiba PENDING), BC 25029 (Monica Breier Fiametti PENDING), BC 25030 (Tayron Sanches Feijo PARTIAL), BC 25033 (Jingyi Yang PENDING).

## Fix Recipe (NOT YET RUN)

Step 1 — Insert August Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish August Bank Holiday 2026', true, NOW());

Step 2 — Shunt 21 booking courses from Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04', end_date = end_date + INTERVAL '1 day'
  WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984,
               25002, 25003, 25010, 25016, 25028, 25035,
               97, 24627, 24999, 25029, 25030, 25033);

Step 3 — Deactivate duplicate booking course 25003:
  UPDATE booking_courses SET active = false WHERE id = 25003;

Step 4 — Verify:
  SELECT id, name, start_date, end_date, active FROM booking_courses
  WHERE id IN (88, 1755, 24956, 25002, 25003) ORDER BY id;

## Risk
Category: bookings, holidays. Reversible: yes. Blast radius: 21 booking courses, 20 distinct students.
WINDOW CLOSES TONIGHT (Sat 1 Aug) — fix must run before school opens Mon 2026-08-03.

## Status
Open — 40th check (13th today). NOT FIXED. WINDOW CLOSES TONIGHT.
Last checked: 2026-08-01 UTC
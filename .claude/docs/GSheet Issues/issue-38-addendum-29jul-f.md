Issue 38 — Aug Bank Holiday 2026 (158th check, 29 Jul 2026)

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

Symptom
=======
August Bank Holiday (Mon 2026-08-03) absent from school_closures. 20 BCs starting Aug 3 will show students
starting on a school holiday.

Root cause (DB, 29 Jul 2026 UTC)
=================================
- school_closures: 9 records (Good Fridays 2026-2030, Christmas 2026-2029). No Aug 3, 2026 entry.
- 20 active BCs start on 2026-08-03. Count REVERTED to 20 (prior H said 12; fix was NEVER run).
- BC 25006 (Marina Larripa, bk 18228): start=2026-07-27, end=2026-08-03 — needs end_date -> 2026-08-04.
- BC 25003 (Aleix Cervera Gonzalez, bk 18225): duplicate of BC 25002 — deactivate, do not shunt.
- DEADLINE: Fri 31 Jul 2026. Must act by Thu 30 Jul EOD.

Full list — 20 BCs starting 2026-08-03
=======================================
BC 88     | Morning General                   | bk 82    | Africa Mera Bachir            | ends 2026-08-07
BC 97     | Academic Year Morning             | bk 89    | Gustavo Ferreira              | ends 2026-12-18
BC 1755   | Morning General                   | bk 1571  | Maria Giulia Serpi            | ends 2026-08-14
BC 1766   | AY Renewal Morning                | bk 1581  | Maria Eduarda Alves Paiva     | ends 2026-09-04
BC 24627  | Morning General                   | bk 17853 | Angelica Guerin               | ends 2026-08-14
BC 24908  | General English AM                | bk 18128 | Ai Tsunashima                 | ends 2026-08-21
BC 24956  | General English AM                | bk 18180 | Giampaolo Russo               | ends 2026-09-11 (Issue 41)
BC 24958  | Academic Year Morning             | bk 18182 | Aurora Madril Oliveira Molina | ends 2027-02-05
BC 24959  | Academic Year Morning             | bk 18183 | Diego Alves da Silva Molina   | ends 2027-02-05
BC 24964  | General English AM Plus           | bk 18188 | Luana Salzano                 | ends 2026-08-14
BC 24970  | Academic Year Afternoon           | bk 18194 | Tsengelbayar Mendsaikhan      | ends 2027-02-05
BC 24984  | Intensive General English & IELTS | bk 18207 | Deva Sofia Onorato            | ends 2026-08-25
BC 24999  | General English PM                | bk 18222 | Soumaya Bourguiba             | ends 2026-08-29
BC 25002  | General English AM                | bk 18225 | Aleix Cervera Gonzalez        | ends 2026-09-18
BC 25003  | General English AM                | bk 18225 | Aleix Cervera Gonzalez        | ends 2026-09-18 -- DUPLICATE -> DEACTIVATE
BC 25010  | General English AM                | bk 18232 | Alin Merticariu               | ends 2026-08-28
BC 25016  | Life Pass Morning                 | bk 18238 | Anderson da Silva Martins     | ends 2027-01-22
BC 25028  | Intensive General English         | bk 18249 | Edgar Gilabert Mata           | ends 2026-08-28
BC 25029  | Academic Year Morning             | bk 18250 | Monica Breier Fiametti        | ends 2026-11-13
BC 25030  | General English PM                | bk 18251 | Tayron Sanches Feijo Filho    | ends 2026-08-28

Fix recipe — NOT YET RUN
=========================

Step 1 — Insert Aug Bank Holiday school closure
NOT YET RUN:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2 — Shunt 19 BCs: move start_date from 2026-08-03 to 2026-08-04
(All except BC 25003 which is a duplicate and should be deactivated)
NOT YET RUN:
  UPDATE booking_courses
  SET start_date = '2026-08-04', updated_at = NOW()
  WHERE id IN (
    88, 97, 1755, 1766,
    24627, 24908, 24956, 24958, 24959, 24964, 24970,
    24984, 24999, 25002, 25010, 25016, 25028, 25029, 25030
  )
  AND active = true AND start_date = '2026-08-03';
  Verify: SELECT id, start_date FROM booking_courses WHERE id IN (...) AND start_date = '2026-08-03';
  Should return 0 rows.

Step 3 — Extend BC 25006 end date (Marina Larripa, booking 18228)
NOT YET RUN:
  UPDATE booking_courses SET end_date = '2026-08-04', updated_at = NOW()
  WHERE id = 25006 AND end_date = '2026-08-03';

Step 4 — Deactivate duplicate BC 25003 (Aleix Cervera Gonzalez)
NOT YET RUN:
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE id = 25003 AND booking_id = 18225;
  Verify: SELECT id, active FROM booking_courses WHERE booking_id = 18225;
  Should show 25002 active, 25003 inactive.

Risk / category
===============
Bookings — medium blast radius; fully reversible.
Students starting Mon Aug 3 will show on a school holiday without this fix.
BC 25003 deactivation is safe (duplicate row, same booking).

Status
======
OPEN — Fix NOT RUN. 158th check 29 Jul 2026 UTC.
DEADLINE: Fri 31 Jul 2026 — act by Thu 30 Jul EOD.

Last checked
============
2026-07-29 UTC

Issue 38 - August Bank Holiday 2026-08-03 (FINAL WINDOW)
Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

Symptom
August Bank Holiday 2026-08-03 must be inserted into school_closures so the shunt
system pushes 21 affected booking courses to Aug 4 (Tuesday).

Root cause - 53rd check Sun 2 Aug 2026 UTC
- school_closures has 9 entries (Good Fridays 2026-2030 + Christmas 2026-2029). No August BH.
- Confirmed empty: SELECT * FROM school_closures WHERE start_date <= 2026-08-03 AND end_date >= 2026-08-03 returns 0 rows.
- 21 active booking courses start on 2026-08-03 (verified fresh this run).
- School opens Mon 09:00 BST (08:00 UTC) - approximately 6 hours remain.

BCs affected (shunt to Aug 4; deactivate BC 25003 - duplicate):
BC 88   - Morning General, bk 82, Africa Mera Bachir
BC 97   - Academic Year Morning, bk 89, Gustavo Ferreira
BC 1755 - Morning General, bk 1571, Maria Giulia Serpi
BC 1766 - Academic Year Renewal Morning, bk 1581, Maria Eduarda Alves Paiva
BC 24627 - Morning General, bk 17853, Angelica Guerin
BC 24908 - General English AM, bk 18128, Ai Tsunashima
BC 24956 - General English AM, bk 18180, Giampaolo Russo (also Issue 41)
BC 24958 - Academic Year Morning, bk 18182, Aurora Madril Oliveira Molina
BC 24959 - Academic Year Morning, bk 18183, Diego Alves da Silva Molina
BC 24964 - General English AM Plus, bk 18188, Luana Salzano
BC 24984 - Intensive General English + IELTS, bk 18207, Deva Sofia Onorato
BC 24999 - General English PM, bk 18222, Soumaya Bourguiba
BC 25002 - General English AM, bk 18225, Aleix Cervera Gonzalez (KEEP - shunt)
BC 25003 - General English AM, bk 18225, Aleix Cervera Gonzalez (DUPLICATE - deactivate)
BC 25010 - General English AM, bk 18232, Alin Merticariu
BC 25016 - Life Pass Morning, bk 18238, Anderson da Silva Martins
BC 25028 - Intensive General English, bk 18249, Edgar Gilabert Mata
BC 25029 - Academic Year Morning, bk 18250, Monica Breier Fiametti
BC 25030 - General English PM, bk 18251, Tayron Sanches Feijo Filho
BC 25033 - General English PM, bk 18254, Jingyi Yang
BC 25035 - General English Academic Year AM (Plus), bk 17915, Rakan Alghamdi

Fix recipe - NOT YET RUN

Step 1: Insert August Bank Holiday into school_closures
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday)
  VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, Irish Public Holiday, false);
  Note: verify is_paid_holiday with Neil - all existing closures are false.

Step 2: Shunt 20 BCs from Aug 3 to Aug 4 (exclude BC 25003)
  SELECT id, name, start_date, booking_id FROM booking_courses
  WHERE start_date = 2026-08-03 AND active = true AND id != 25003;
  -- Expected: 20 rows
  UPDATE booking_courses SET start_date = 2026-08-04
  WHERE start_date = 2026-08-03 AND active = true AND id != 25003;
  -- Expected: 20 rows updated

Step 3: Deactivate duplicate BC 25003
  UPDATE booking_courses SET active = false WHERE id = 25003;

Step 4: Verify
  SELECT id, start_date, active FROM booking_courses WHERE id IN (25002, 25003);
  -- BC 25002: start_date=2026-08-04, active=true
  -- BC 25003: start_date=2026-08-03, active=false
  SELECT * FROM school_closures WHERE start_date = 2026-08-03;
  -- 1 row returned (new BH entry)

Risk / category
Category: bookings + data-hygiene | Reversible: Yes
Blast radius: 21 booking courses, 20 students; Monday morning operations
URGENT: Must run before 08:00 UTC Monday 3 Aug 2026

Status: Open - NOT YET RUN - FINAL WINDOW
Last checked: Sun 2 Aug 2026 UTC (52nd check)

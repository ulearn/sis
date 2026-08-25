Issue 38 - August Bank Holiday 2026-08-03 (URGENT - FINAL WINDOW)
Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

Symptom
August Bank Holiday 2026-08-03 must be inserted into school_closures.

Root cause - 55th check Sun 2 Aug 2026 UTC (5th today)
- school_closures: 9 entries (Good Fridays 2026-2030 + Christmas 2026-2029). No August BH.
- 21 active booking courses still start 2026-08-03 (verified fresh this run).
- BC 25003 (Aleix Cervera, bk 18225): confirmed duplicate of BC 25002 (0 SCAs each). Deactivate only.
- Must run before 08:00 UTC Monday 3 Aug 2026.

BCs to shunt to Aug 4 (20) plus BC 25003 to deactivate:
BC 88   bk82  Africa Mera Bachir (ends Aug 7)
BC 97   bk89  Gustavo Ferreira (ends Dec 18)
BC 1755 bk1571 Maria Giulia Serpi (ends Aug 14)
BC 1766 bk1581 Maria Eduarda Alves Paiva (ends Sep 4)
BC 24627 bk17853 Angelica Guerin (ends Aug 14)
BC 24908 bk18128 Ai Tsunashima (ends Aug 21)
BC 24956 bk18180 Giampaolo Russo (ends Sep 11)
BC 24958 bk18182 Aurora Madril Oliveira Molina (ends Feb 5 2027)
BC 24959 bk18183 Diego Alves da Silva Molina (ends Feb 5 2027)
BC 24964 bk18188 Luana Salzano (ends Aug 14)
BC 24984 bk18207 Deva Sofia Onorato (ends Aug 25)
BC 24999 bk18222 Soumaya Bourguiba (ends Aug 29)
BC 25002 bk18225 Aleix Cervera Gonzalez (ends Sep 18) - SHUNT
BC 25010 bk18232 Alin Merticariu (ends Aug 28)
BC 25016 bk18238 Anderson da Silva Martins (ends Jan 22 2027)
BC 25028 bk18249 Edgar Gilabert Mata (ends Aug 28)
BC 25029 bk18250 Monica Breier Fiametti (ends Nov 13)
BC 25030 bk18251 Tayron Sanches Feijo Filho (ends Aug 28)
BC 25033 bk18254 Jingyi Yang (ends Aug 28)
BC 25035 bk17915 Rakan Alghamdi (ends Dec 18)
BC 25003 bk18225 Aleix Cervera Gonzalez - DEACTIVATE (duplicate, 0 SCAs)

Fix recipe - NOT YET RUN

Step 1: Insert August Bank Holiday
  INSERT INTO school_closures (name,start_date,end_date,note,is_paid_holiday)
  VALUES ('August Bank Holiday','2026-08-03','2026-08-03','Irish Public Holiday',false);

Step 2: Deactivate BC 25003
  UPDATE booking_courses SET active=false WHERE id=25003;

Step 3: Shunt 20 BCs to Aug 4
  Preview: SELECT id,name,start_date FROM booking_courses WHERE start_date=2026-08-03 AND active=true;
  Expected: 20 rows.
  Shunt:   UPDATE booking_courses SET start_date=2026-08-04 WHERE start_date=2026-08-03 AND active=true;

Step 4: Verify
  SELECT id,start_date,active FROM booking_courses WHERE id IN (25002,25003);
  -- BC 25002: start_date=2026-08-04 active=true; BC 25003: start_date=2026-08-03 active=false
  SELECT COUNT(*) FROM booking_courses WHERE start_date=2026-08-03 AND active=true;
  -- 0 rows

Risk: bookings + data-hygiene | Reversible: Yes | Blast radius: 20 students/21 BCs
URGENT: Must run before 08:00 UTC Monday 3 Aug 2026

Status: Open - NOT YET RUN - FINAL WINDOW TONIGHT
Last checked: Sun 2 Aug 2026 UTC (55th check, 5th today)
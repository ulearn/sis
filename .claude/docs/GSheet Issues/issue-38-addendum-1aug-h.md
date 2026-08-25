Issue 38 — August Bank Holiday 2026-08-03

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40 | Check: 43rd (16th Sat 1 Aug 2026 UTC)

Symptom:
August Bank Holiday 2026-08-03 absent from school_closures; 21 active booking courses start on that date.

Root Cause (fresh DB - NOT YET FIXED):
9 school closures only (Good Fridays 2026-2030 + Christmas 2026-2029). Aug BH absent. Verified 2026-08-01.

Confirmed = true (15): BC 88 (Africa Mera Bachir), BC 1755 (Maria Giulia Serpi), BC 1766 (Maria Eduarda Alves Paiva), BC 24908 (Ai Tsunashima), BC 24956 (Giampaolo Russo - ARRIVED TODAY Aug 2), BC 24958 (Aurora Madril), BC 24959 (Diego Alves Molina), BC 24964 (Luana Salzano), BC 24984 (Deva Onorato), BC 25002 (Aleix Cervera), BC 25003 (Aleix DUPLICATE), BC 25010 (Alin Merticariu), BC 25016 (Anderson Martins), BC 25028 (Edgar Gilabert), BC 25035 (Rakan Alghamdi).
Unconfirmed/pending (6): BC 97 (Gustavo Ferreira), BC 24627 (Angelica Guerin), BC 24999 (Soumaya Bourguiba), BC 25029 (Monica Breier), BC 25030 (Tayron Sanches), BC 25033 (Jingyi Yang).

Fix Recipe (NOT YET RUN):
Step 1 - Insert closure:
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday, created_at) VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish August Bank Holiday 2026', true, NOW());
Step 2 - Shunt 21 BCs:
  UPDATE booking_courses SET start_date = '2026-08-04', end_date = end_date + INTERVAL '1 day' WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25003, 25010, 25016, 25028, 25035, 97, 24627, 24999, 25029, 25030, 25033);
Step 3 - Deactivate duplicate BC 25003:
  UPDATE booking_courses SET active = false WHERE id = 25003;
Step 4 - Verify: SELECT id, start_date FROM booking_courses WHERE id IN (88, 24956, 25002, 25003);

Risk: bookings/holidays, reversible, 21 BCs 20 students.
ABSOLUTE FINAL WINDOW - school opens Mon 2026-08-03 at 09:00 (< 36 hours from now).

Status: Open - 43rd check (16th today). NOT FIXED.
Last checked: 2026-08-01 UTC

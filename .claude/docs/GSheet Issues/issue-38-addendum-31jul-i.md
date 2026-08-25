# Issue 38 -- Aug Bank Holiday Fix (21st check, 3rd check Fri 31 Jul 2026 UTC)
OPEN -- Fix NOT RUN -- DEADLINE TODAY (last business day before Aug 3)

## Evidence
- school_closures Jul-Sep 2026: 0 rows (Aug Bank Holiday 2026-08-03 still absent)
- Active booking courses starting 2026-08-03: 21 (unchanged)
- All 14 confirmed-shunt booking courses still start 2026-08-03 -- none shunted

## Confirmed to shunt (14 BCs, all re-verified CONFIRMED today):
BC 88 Africa Mera Bachir bk82 | BC 1755 Maria Giulia Serpi bk1571 | BC 1766 Maria Eduarda Alves Paiva bk1581
BC 24908 Ai Tsunashima bk18128 | BC 24956 Giampaolo Russo bk18180 | BC 24958 Aurora Madril Oliveira Molina bk18182
BC 24959 Diego Alves da Silva Molina bk18183 | BC 24964 Luana Salzano bk18188 | BC 24984 Deva Sofia Onorato bk18207
BC 25002 Aleix Cervera Gonzalez bk18225 | BC 25010 Alin Merticariu bk18232 | BC 25016 Anderson da Silva Martins bk18238
BC 25028 Edgar Gilabert Mata bk18249 | BC 25035 Rakan Alghamdi bk17915

## Anomaly -- verify before shunting:
- BC 24627 (Angelica Guerin, booking 17853): CONFIRMED status but confirmed=false

## Pending BCs -- confirm with staff then shunt:
- BC 97 (Gustavo Ferreira, bk89): PENDING, paid=null, open=EUR 4655
- BC 24999 (Soumaya Bourguiba, bk18222): PENDING, paid=0, open=EUR 1583
- BC 25029 (Monica Breier Fiametti, bk18250): PENDING, paid=0, open=EUR 450
- BC 25030 (Tayron Sanches Feijo Filho, bk18251): PENDING, paid=0, open=EUR 530
- BC 25033 (Jingyi Yang, bk18254): PENDING, paid=0, open=EUR 480

## Duplicate: BC 25003 (Aleix Cervera Gonzalez bk18225) -- duplicate of BC 25002, still EXISTS
## Ending Aug 3: BC 25006 (Marina Larripa bk18228, end=2026-08-03, active=true) -- clarify intent

## Fix Recipe (NOT YET RUN)

Step 1 -- Insert August Bank Holiday closure (NOT YET RUN):
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at) VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2 -- Shunt 14 confirmed booking courses to Aug 4 (NOT YET RUN):
  UPDATE booking_courses SET start_date = '2026-08-04', updated_at = NOW() WHERE id IN (88,1755,1766,24908,24956,24958,24959,24964,24984,25002,25010,25016,25028,25035) AND start_date = '2026-08-03';

Step 3 -- Resolve BC 24627 anomaly (NOT YET RUN):
  Check booking 17853 in HubSpot. If payment confirmed, set confirmed=true; add BC 24627 to shunt.

Step 4 -- Delete duplicate BC 25003 (NOT YET RUN):
  SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 25003; -- must be 0
  DELETE FROM booking_courses WHERE id = 25003;

Step 5 -- Pending booking courses (NOT YET RUN):
  Confirm BC 97, 24999, 25029, 25030, 25033 with KC/AC. If starting Aug 3 week:
  UPDATE booking_courses SET start_date = '2026-08-04', updated_at = NOW() WHERE id IN (97,24999,25029,25030,25033) AND start_date = '2026-08-03';

Step 6 -- BC 25006 Marina Larripa (NOT YET RUN):
  If continuing: UPDATE booking_courses SET end_date='2026-08-04', updated_at=NOW() WHERE id=25006;
  If finishing:  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=25006;
  Confirm with Diego/KC first.

Risk: bookings/data-hygiene. Reversible. Blast radius: 1 closure + up to 21 BC updates + 1 delete.
Status: OPEN -- NOT RUN -- 21st check (3rd check today) Fri 31 Jul 2026 UTC.
FIX MUST RUN TODAY -- last business day before the bank holiday.
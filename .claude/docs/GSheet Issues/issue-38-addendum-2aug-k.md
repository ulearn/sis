# Issue 38 - Aug Bank Holiday 2026-08-03 (CRITICAL)
Reporter: Staff | Area: Holidays/Bookings | Sheet row: 40

Symptom: No school closure in DB for Aug Bank Holiday (Aug 3 2026). 21 active booking courses start Aug 3.

Root cause (64th check, 14th today - Sun 2 Aug 2026 UTC):
- Confirmed: school_closures table has ZERO entries for Jul-Sep 2026
- 21 active booking courses have start_date = 2026-08-03 - list unchanged since issue first raised
- Duplicate BCs 25002 + 25003 (booking 18225, Aleix Cervera): both active; BC 25003 has 0 SCAs - deactivate
- BC 24956 (Giampaolo Russo, Issue 41): in the shunt list; Issue 41 SCA depends on this fix running first
- BH IS TOMORROW. This fix must run tonight (Sun 2 Aug) before school reopens Tue 4 Aug.

21 BCs to shunt to Aug 4:
88 (Africa Mera Bachir, bk82), 97 (Gustavo Ferreira, bk89), 1755 (Maria Giulia Serpi, bk1571),
1766 (Maria Eduarda Alves Paiva, bk1581), 24627 (Angelica Guerin, bk17853),
24908 (Ai Tsunashima, bk18128), 24956 (Giampaolo Russo, bk18180),
24958 (Aurora Madril Oliveira Molina, bk18182), 24959 (Diego Alves da Silva Molina, bk18183),
24964 (Luana Salzano, bk18188), 24984 (Deva Sofia Onorato, bk18207),
24999 (Soumaya Bourguiba, bk18222), 25002 (Aleix Cervera Gonzalez, bk18225),
25010 (Alin Merticariu, bk18232), 25016 (Anderson da Silva Martins, bk18238),
25028 (Edgar Gilabert Mata, bk18249), 25029 (Monica Breier Fiametti, bk18250),
25030 (Tayron Sanches Feijo Filho, bk18251), 25033 (Jingyi Yang, bk18254),
25035 (Rakan Alghamdi, bk17915)
DEACTIVATE: 25003 (Aleix Cervera Gonzalez - duplicate, 0 SCAs)

Fix recipe (NOT YET RUN):

Step 1 - Insert Aug Bank Holiday school closure:
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
VALUES ('August Bank Holiday 2026', '2026-08-03', '2026-08-03', true);

Step 2 - Shunt 20 active BCs from Aug 3 to Aug 4:
UPDATE booking_courses
SET start_date = '2026-08-04'
WHERE id IN (88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24984, 24999, 25002, 25010, 25016, 25028, 25029, 25030, 25033, 25035)
AND active = true;

Step 3 - Deactivate duplicate BC 25003:
UPDATE booking_courses SET active = false WHERE id = 25003;

Step 4 - Verify:
SELECT id, name, start_date FROM booking_courses WHERE start_date = '2026-08-03' AND active = true;
-- Should return 0 rows

Risk: bookings. 21 BCs affected. Reversible (revert start_date). BC 25003 safe to deactivate (0 SCAs).
Status: OPEN. Fix NOT RUN. Last checked: Sun 2 Aug 2026 UTC (64th check, 14th today)

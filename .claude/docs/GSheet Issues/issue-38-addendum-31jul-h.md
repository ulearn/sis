Issue 38 - Aug Bank Holiday Fix (20th check, 2nd check Fri 31 Jul 2026 UTC)
Reporter: PG, Area: Holidays / Bookings, Sheet row: 40
OPEN - Fix NOT RUN - DEADLINE TODAY (last business day before Aug 3)

EVIDENCE (2nd check Fri 31 Jul 2026 UTC):
school_closures Jul-Sep 2026: 0 rows (August Bank Holiday still absent)
Active BCs startDate=2026-08-03: 21 (unchanged)

Confirmed to shunt to Aug 4 (14 BCs):
  BC 88 (Africa Mera Bachir bk82), BC 1755 (Maria Giulia Serpi bk1571),
  BC 1766 (Maria Eduarda Alves Paiva bk1581), BC 24908 (Ai Tsunashima bk18128),
  BC 24956 (Giampaolo Russo bk18180), BC 24958 (Aurora Madril Oliveira Molina bk18182),
  BC 24959 (Diego Alves da Silva Molina bk18183), BC 24964 (Luana Salzano bk18188),
  BC 24984 (Deva Sofia Onorato bk18207), BC 25002 (Aleix Cervera Gonzalez bk18225),
  BC 25010 (Alin Merticariu bk18232), BC 25016 (Anderson da Silva Martins bk18238),
  BC 25028 (Edgar Gilabert Mata bk18249), BC 25035 (Rakan Alghamdi bk17915)

Anomaly (verify before shunting): BC 24627 (Angelica Guerin bk17853 CONFIRMED but confirmed=false)

Pending (confirm then shunt): BC 97 (Gustavo Ferreira bk89), BC 24999 (Soumaya Bourguiba bk18222),
  BC 25029 (Monica Breier Fiametti bk18250), BC 25030 (Tayron Sanches Feijo bk18251), BC 25033 (Jingyi Yang bk18254)

Duplicate to delete: BC 25003 (Aleix Cervera Gonzalez bk18225 - duplicate of BC 25002)

Ending Aug 3 (extend or close): BC 25006 (Marina Larripa bk18228, ends 2026-08-03, active=true)

FIX RECIPE (NOT YET RUN):

Step 1 - Insert Aug BH closure (NOT YET RUN):
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2 - Shunt 14 confirmed BCs to Aug 4 (NOT YET RUN):
  UPDATE booking_courses SET start_date = '2026-08-04', updated_at = NOW()
  WHERE id IN (88,1755,1766,24908,24956,24958,24959,24964,24984,25002,25010,25016,25028,25035)
    AND start_date = '2026-08-03';

Step 3 - Resolve BC 24627 anomaly (NOT YET RUN):
  Check booking 17853 in SIS/HubSpot. If payment received, mark confirmed, add to shunt.

Step 4 - Delete duplicate BC 25003 (NOT YET RUN):
  SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 25003; -- must be 0
  DELETE FROM booking_courses WHERE id = 25003;

Step 5 - Resolve pending BCs (NOT YET RUN):
  Review each booking with KC/AC. Shunt if CONFIRMED.

Step 6 - BC 25006 Marina Larripa (NOT YET RUN):
  If continuing after BH: UPDATE booking_courses SET end_date='2026-08-04', updated_at=NOW() WHERE id=25006;
  If finishing Aug 3:     UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=25006;
  Confirm with Diego/KC first.

RISK: Bookings/data-hygiene. Reversible. Blast radius: 1 closure insert + up to 21 BC updates + 1 delete.
STATUS: OPEN - NOT RUN - Last checked: Fri 31 Jul 2026 UTC (20th check, 2nd check today)
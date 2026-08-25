Issue 38 - Aug BH 2026 (25th check/7th today Fri 31 Jul 2026 UTC)

Reporter: PG | Area: Holidays/Bookings | Sheet row: 40

Symptom: Booking courses start on Aug BH Mon Aug 3 2026. Closure absent from school_closures.

Root cause (live query Fri 31 Jul UTC, 7th check today)
- school_closures: NO entry for 2026-08-03 confirmed.
- 21 active booking courses have start_date = 2026-08-03.

CONFIRMED + confirmed=true => shunt to Aug 4 (15 BCs):
BC 88    Morning General                  Africa Mera Bachir          end 2026-08-07
BC 1755  Morning General                  Maria Giulia Serpi          end 2026-08-14
BC 1766  Academic Year Renewal Morning    Maria Eduarda Alves Paiva   end 2026-09-04
BC 24908 General English AM               Ai Tsunashima               end 2026-08-21
BC 24956 General English AM               Giampaolo Russo             end 2026-09-11
BC 24958 Academic Year Morning            Aurora Madril Oliveira Molina end 2027-02-05
BC 24959 Academic Year Morning            Diego Alves da Silva Molina end 2027-02-05
BC 24964 General English AM Plus          Luana Salzano               end 2026-08-14
BC 24984 Intensive General English+IELTS  Deva Sofia Onorato          end 2026-08-25
BC 25002 General English AM               Aleix Cervera Gonzalez      end 2026-09-18
BC 25003 General English AM (DUPLICATE)   Aleix Cervera Gonzalez      end 2026-09-18 [Step 3]
BC 25010 General English AM               Alin Merticariu             end 2026-08-28
BC 25016 Life Pass Morning                Anderson da Silva Martins   end 2027-01-22
BC 25028 Intensive General English        Edgar Gilabert Mata         end 2026-08-28
BC 25035 General English Academic Year AM Rakan Alghamdi              end 2026-12-18

NOTE BC 25003: Was PENDING/confirmed=false; now CONFIRMED/confirmed=true (changed since 31jul-k).
Still duplicate of BC 25002 (booking 18225, same student, same dates).
0 SCAs => DELETE FROM booking_courses WHERE id = 25003;
SCAs present => reassign to booking_course_id = 25002 first, then delete.

CONFIRMED + confirmed=false => check before shunting:
BC 24627 Morning General Angelica Guerin

PENDING + confirmed=false => leave as-is (5 BCs):
97 (Gustavo Ferreira), 24999 (Soumaya Bourguiba), 25029 (Monica Breier Fiametti), 25030 (Tayron Sanches Feijo Filho), 25033 (Jingyi Yang)

BC 25006 (Marina Larripa, end_date 2026-08-03): Aug 3 is closed; last teaching day was Jul 31.
  Option A (owed extra day): UPDATE booking_courses SET end_date = '2026-08-04' WHERE id = 25006;
  Option B (not owed): UPDATE booking_courses SET end_date = '2026-07-31' WHERE id = 25006;
  Confirm with AC/PG which applies.

Fix recipe - NOT YET RUN

Step 1: Insert Aug BH
  INSERT INTO school_closures (created_at, name, start_date, end_date, note, is_paid_holiday)
  VALUES (NOW(), 'August Bank Holiday', '2026-08-03', '2026-08-03', 'Public Holiday Aug 2026', false);

Step 2: Shunt 14 confirmed BCs (not 25003) to Aug 4
  UPDATE booking_courses SET start_date = '2026-08-04'
  WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25010, 25016, 25028, 25035)
    AND start_date = '2026-08-03' AND active = true;
  Expected: 14 rows updated

Step 3: Handle duplicate BC 25003
  SELECT id FROM student_class_assignments WHERE booking_course_id = 25003;
  0 rows => DELETE FROM booking_courses WHERE id = 25003;
  Rows exist => reassign to booking_course_id = 25002, then delete.

Step 4: Check BC 24627
  SELECT bc.id, b.status, b.confirmed FROM booking_courses bc JOIN bookings b ON b.id=bc.booking_id WHERE bc.id = 24627;
  CONFIRMED + confirmed=true => UPDATE booking_courses SET start_date = '2026-08-04' WHERE id = 24627;

Step 5: Fix BC 25006 end_date (option A or B after confirming with AC/PG)

Step 6: Verify
  SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true; -- Expected: 5
  SELECT * FROM school_closures WHERE start_date = '2026-08-03'; -- Expected: 1 row

Risk: bookings, data-integrity | Reversible: Yes
Blast radius: 14-15 BCs updated, 1 deleted, 1 closure inserted
CRITICAL: LAST WINDOW - school reopens Monday Aug 4.

Status: Fix NOT RUN. 25th check, 7th today Fri 31 Jul 2026 UTC.

# Issue 38 -- Aug Bank Holiday Shunt (6th check Tue 4 Aug 2026 UTC)
Reporter: NM | Area: Holidays/Bookings | Sheet row: 40

## Symptom
School closed Mon Aug 3 (Aug Bank Holiday). 21 booking courses have startDate=2026-08-03 and
have never been shunted to the next school day (Tue Aug 4). Students attending today (day 2)
with 0 class assignments.

## Root Cause (verified 2026-08-04 UTC, 6th check)
- school_closures table has 9 entries: Good Fridays 2026-2030 + Christmas 2026-2029.
  August Bank Holiday 2026-08-03 is ABSENT.
- 21 booking courses: all startDate = 2026-08-03, active = true, 0 student_class_assignments.
  Shunt has not run.
- School is open today (Tue 4 Aug). Correct shunt target: 2026-08-04.
- Anomaly: Aleix Cervera Gonzalez has TWO booking courses (25002 + 25003) both starting Aug 3
  on the same booking (18225). Possible data entry duplication -- verify before assigning SCAs.

## Full student/BC list (21 BCs)
  BC  88 | Morning General (ends Aug 7)             | Africa Mera Bachir
  BC  97 | Academic Year Morning (ends Dec 18)       | Gustavo Ferreira
  BC 1755 | Morning General (ends Aug 14)            | Maria Giulia Serpi
  BC 1766 | AY Renewal Morning (ends Sep 4)          | Maria Eduarda Alves Paiva
  BC 24627 | Morning General (ends Aug 14)           | Angelica Guerrin
  BC 24908 | General English AM (ends Aug 21)        | Ai Tsunashima
  BC 24956 | General English AM (ends Sep 11)        | Giampaolo Russo (also Issue 41)
  BC 24958 | Academic Year Morning (ends Feb 5 2027) | Aurora Madril Oliveira Molina
  BC 24959 | Academic Year Morning (ends Feb 5 2027) | Diego Alves da Silva Molina
  BC 24964 | General English AM Plus (ends Aug 14)   | Luana Salzano
  BC 24984 | Intensive GE & IELTS (ends Aug 25)      | Deva Sofia Onorato
  BC 24999 | General English PM (ends Aug 29)        | Soumaya Bourguiba
  BC 25002 | General English AM (ends Sep 18) -- DUPLICATE? | Aleix Cervera Gonzalez
  BC 25003 | General English AM (ends Sep 18) -- DUPLICATE? | Aleix Cervera Gonzalez
  BC 25010 | General English AM (ends Aug 28)        | Alin Merticariu
  BC 25016 | Life Pass Morning (ends Jan 22 2027)    | Anderson da Silva Martins
  BC 25028 | Intensive General English (ends Aug 28) | Edgar Gilabert Mata
  BC 25029 | Academic Year Morning (ends Nov 13)     | Monica Breier Fiametti
  BC 25030 | General English PM (ends Aug 28)        | Tayron Sanches Feijo Filho
  BC 25033 | General English PM (ends Aug 28)        | Jingyi Yang
  BC 25035 | GE AY AM Plus (ends Dec 18)             | Rakan Alghamdi

## Fix Recipe (NOT YET RUN)

Step 1 -- Verify count before shunt:
  SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true;
  Expect: 21

Step 2 -- Insert August Bank Holiday closure (retroactive):
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Public holiday Ireland 2026', false);

Step 3 -- Shunt 21 BCs from Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04'
  WHERE start_date = '2026-08-03' AND active = true;
  Expect: 21 rows updated

Step 4 -- Deactivate BC 25006 (Marina Larripa, ended Aug 3, now 1 day stale):
  UPDATE booking_courses SET active = false WHERE id = 25006;

Step 5 -- Investigate Aleix Cervera Gonzalez duplicate BCs:
  SELECT id, name, start_date, end_date, active FROM booking_courses WHERE booking_id = 18225;
  Both BCs 25002 and 25003 have same name+dates -- determine which is correct,
  deactivate the duplicate before assigning SCAs.

Step 6 -- Assign classes via SIS admin for all 21 affected students.
  Priority: Giampaolo Russo (Issue 41 -- attending today with 0 assignments).

## Risk / Category
bookings, data-hygiene | Reversible: yes | Blast radius: 21 BCs, ~20 students

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (6th check today)
Issue 38 -- Aug Bank Holiday Missing (123rd run, Mon 27 Jul 2026 UTC)
Reporter: PG | Area: Holidays / Bookings | Sheet row: 40

SYMPTOM
Aug 3 2026 is Bank Holiday Monday. 17 active booking courses start on that date.

ROOT CAUSE (fresh DB Mon 27 Jul UTC)
school_closures: 9 entries only (Good Fridays 2026-2030, Christmas 2026-2029).
Aug Bank Holiday 2026-08-03 is ABSENT -- auto-shunt cannot trigger.
17 BCs with start_date=2026-08-03 and active=true confirmed by live query.

Affected BC IDs and students:
  BC88 Morning General - Africa Mera Bachir (ends Aug 7)
  BC97 Academic Year Morning - Gustavo Ferreira (ends Dec 18)
  BC1755 Morning General - Maria Giulia Serpi (ends Aug 14)
  BC1766 Academic Year Renewal Morning - Maria Eduarda Alves Paiva (ends Sep 4)
  BC24627 Morning General - Angelica Guerin (ends Aug 14)
  BC24908 General English AM - Ai Tsunashima (ends Aug 21)
  BC24956 General English AM - Giampaolo Russo (ends Sep 11)
  BC24958 Academic Year Morning - Aurora Madril Oliveira Molina (ends Feb 2027)
  BC24959 Academic Year Morning - Diego Alves da Silva Molina (ends Feb 2027)
  BC24964 General English AM Plus - Luana Salzano (ends Aug 14)
  BC24970 Academic Year Afternoon - Tsengelbayar Mendsaikhan (ends Feb 2027)
  BC24984 Intensive General English + IELTS - Deva Sofia Onorato (ends Aug 25)
  BC24999 General English PM - Soumaya Bourguiba (ends Aug 29)
  BC25002 General English AM - Aleix Cervera Gonzalez (ends Sep 18)
  BC25003 General English AM - Aleix Cervera Gonzalez (ends Sep 18)
  BC25010 General English AM - Alin Merticariu (ends Aug 28)
  BC25016 Life Pass Morning - Anderson da Silva Martins (ends Aug 2028)

FIX RECIPE (NOT YET RUN)

DEADLINE: Fri 31 Jul 2026 -- 4 working days from Mon 27 Jul

Step 1 -- Insert Aug Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true);
  Verify: SELECT * FROM school_closures WHERE start_date = '2026-08-03';

Step 2 -- Shunt 17 BCs from Aug 3 to Aug 4:
  UPDATE booking_courses
  SET start_date = '2026-08-04'
  WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25003,25010,25016)
  AND start_date = '2026-08-03';
  Verify: SELECT id,name,start_date FROM booking_courses
  WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25003,25010,25016);

Step 3 -- Verify no SCAs have weekStart=Aug 3 on affected BCs (most have 0 SCAs).

RISK / CATEGORY
Category: Bookings/school operations | Reversible: Yes | Blast radius: 17 students

STATUS: OPEN -- Fix NOT RUN | Last checked: Mon 27 Jul 2026 UTC
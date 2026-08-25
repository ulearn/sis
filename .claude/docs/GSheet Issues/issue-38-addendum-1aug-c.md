ISSUE 38 -- Aug Bank Holiday fix (URGENT -- FINAL WINDOW)
=========================================================

Area: Holidays/Bookings  Row: 40  Checked: 2026-08-01 UTC (34th hrly, 7th of day)

ROOT CAUSE (7th check of day -- UNCHANGED)
- school_closures: 9 entries. NO August Bank Holiday entry for 2026-08-03.
- 21 active booking courses still start 2026-08-03: 15 confirmed=true, 6 confirmed=false.
- Booking course 25003 (Aleix Cervera, booking 18225): duplicate of BC 25002, same student, same dates.
- Window closes tonight -- school is closed Monday Aug 3.

CONFIRMED (15) booking courses start Aug 3:
  BC 88     Africa Mera Bachir             Morning General         Aug 3 - Aug 7
  BC 1755   Maria Giulia Serpi             Morning General         Aug 3 - Aug 14
  BC 1766   Maria Eduarda Alves Paiva      AY Renewal Morning      Aug 3 - Sep 4
  BC 24908  Ai Tsunashima                  General English AM      Aug 3 - Aug 21
  BC 24956  Giampaolo Russo                General English AM      Aug 3 - Sep 11  (also Issue 41)
  BC 24958  Aurora Madril Oliveira Molina  AY Morning              Aug 3 - Feb 5
  BC 24959  Diego Alves da Silva Molina    AY Morning              Aug 3 - Feb 5
  BC 24964  Luana Salzano                  General English AM Plus Aug 3 - Aug 14
  BC 24984  Deva Sofia Onorato             Intensive Eng + IELTS   Aug 3 - Aug 25
  BC 25002  Aleix Cervera Gonzalez         General English AM      Aug 3 - Sep 18
  BC 25003  Aleix Cervera Gonzalez         General English AM      Aug 3 - Sep 18  (DUPLICATE of 25002)
  BC 25010  Alin Merticariu                General English AM      Aug 3 - Aug 28
  BC 25016  Anderson da Silva Martins      Life Pass Morning       Aug 3 - Jan 22
  BC 25028  Edgar Gilabert Mata            Intensive General Eng   Aug 3 - Aug 28
  BC 25035  Rakan Alghamdi                 General English AY AM+  Aug 3 - Dec 18

UNCONFIRMED (6) booking courses start Aug 3:
  BC 97     Gustavo Ferreira               AY Morning              Aug 3 - Dec 18  (PENDING)
  BC 24627  Angelica Guerin                Morning General         Aug 3 - Aug 14  (CONFIRMED/false anomaly)
  BC 24999  Soumaya Bourguiba              General English PM      Aug 3 - Aug 29  (PENDING)
  BC 25029  Monica Breier Fiametti         AY Morning              Aug 3 - Nov 13  (PENDING)
  BC 25030  Tayron Sanches Feijo Filho     General English PM      Aug 3 - Aug 28  (PARTIAL)
  BC 25033  Jingyi Yang                    General English PM      Aug 3 - Aug 28  (PENDING)

FIX RECIPE (NOT YET RUN)

Step 1 - Insert school closure:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, true, NOW());

Step 2 - Deactivate duplicate booking course 25003:
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=25003;

Step 3 - Shunt 14 confirmed booking courses Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date=2026-08-04, updated_at=NOW()
  WHERE id IN (88,1755,1766,24908,24956,24958,24959,24964,24984,25002,25010,25016,25028,25035)
    AND start_date=2026-08-03 AND active=true;

Step 4 - Shunt 6 unconfirmed booking courses Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date=2026-08-04, updated_at=NOW()
  WHERE id IN (97,24627,24999,25029,25030,25033)
    AND start_date=2026-08-03 AND active=true;

Step 5 - Verify:
  SELECT COUNT(*) FROM booking_courses WHERE start_date=2026-08-03 AND active=true; -- Expected: 0
  SELECT * FROM school_closures WHERE start_date=2026-08-03; -- Expected: 1 row

RISK: bookings/scheduling, reversible, 21 booking courses (1-day shift). Blast radius: 21 students.
STATUS: OPEN - URGENT. Last checked: 2026-08-01 UTC (34th hrly, 7th of day)
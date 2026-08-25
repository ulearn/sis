Issue 38 -- Aug/Oct Bank Holiday Missing -- Addendum 24 Jul (e)

Reporter: NM | Area: Holidays / Bookings | Sheet row: 40
Checked: Fri 24 Jul 2026 UTC -- 81st hourly check, 154th total run

SYMPTOM
August Bank Holiday (Mon 3 Aug 2026) and October Bank Holiday (Mon 26 Oct 2026) absent from school_closures.

ROOT CAUSE (confirmed, unchanged)
school_closures has 9 entries: Good Fridays 2026-2030 and Christmas breaks 2026-2029. No Bank Holiday records.

NEW THIS RUN: 17 Courses Start on the Aug Bank Holiday

BC 88: Morning General, bk 82, Africa Mera Bachir
BC 97: Academic Year Morning, bk 89, Gustavo Ferreira
BC 1755: Morning General, bk 1571, Maria Giulia Serpi
BC 1766: AY Renewal Morning, bk 1581, Maria Eduarda Alves Paiva
BC 24627: Morning General, bk 17853, Angelica Guerin
BC 24908: General English AM, bk 18128, Ai Tsunashima
BC 24956: General English AM, bk 18180, Giampaolo Russo (Issue 41)
BC 24958: Academic Year Morning, bk 18182, Aurora Madril Oliveira Molina
BC 24959: Academic Year Morning, bk 18183, Diego Alves da Silva Molina
BC 24964: General English AM Plus, bk 18188, Luana Salzano
BC 24970: Academic Year Afternoon, bk 18194, Tsengelbayar Mendsaikhan
BC 24984: Intensive General + IELTS, bk 18207, Deva Sofia Onorato
BC 24999: General English PM, bk 18222, Soumaya Bourguiba
BC 25002: General English AM, bk 18225, Aleix Cervera Gonzalez
BC 25003: General English AM, bk 18225, Aleix Cervera Gonzalez (2nd BC)
BC 25010: General English AM, bk 18232, Alin Merticariu
BC 25016: Life Pass Morning, bk 18238, Anderson da Silva Martins

Impact: 17 courses have Mon 3 Aug counted as day 1 of tuition. Class registers created, attendance expected -- school is closed. BC 88/97/1755/1766 are legacy (low IDs); 24xxx-25xxx are current year.

FIX RECIPE (NOT YET RUN)

Step 1 - Insert August Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2 - Insert October Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('October Bank Holiday', '2026-10-26', '2026-10-26', true, NOW());

Step 3 - Review 17 affected courses: determine if short-course students need start dates shifted to Tue 4 Aug.

Step 4 - Confirm:
  SELECT id, name, start_date, end_date, is_paid_holiday FROM school_closures ORDER BY start_date;

RISK
- Category: bookings
- Reversible: Yes (DELETE inserted rows if wrong)
- Blast radius: HIGH - 17 courses affected by Aug BH alone

STATUS
CRITICAL - Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC

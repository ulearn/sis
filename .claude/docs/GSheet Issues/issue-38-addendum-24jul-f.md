Issue 38 -- Aug/Oct Bank Holiday Missing -- Addendum 24 Jul (f)

Reporter: NM | Area: Holidays / Bookings | Sheet row: 40
Checked: Fri 24 Jul 2026 UTC -- 83rd hourly check, 156th total run

SYMPTOM
August Bank Holiday (Mon 3 Aug 2026) and October Bank Holiday (Mon 26 Oct 2026) absent from school_closures.

ROOT CAUSE (confirmed, unchanged)
school_closures has 9 entries: Good Fridays 2026-2030 and Christmas breaks 2026-2029. No Bank Holiday records.

CURRENT STATUS -- UNCHANGED (10 calendar days to Aug BH)

- Closures in DB: 9 total (Good Fridays + Christmas breaks only; no Bank Holidays)
- Aug Bank Holiday Mon 3 Aug 2026: still absent -- 10 calendar days away
- Oct Bank Holiday Mon 26 Oct 2026: still absent
- 17 active booking courses still start on Mon 3 Aug 2026:
  BC 88 Africa Mera Bachir, BC 97 Gustavo Ferreira, BC 1755 Maria Giulia Serpi,
  BC 1766 Maria Eduarda Alves Paiva, BC 24627 Angelica Guerin, BC 24908 Ai Tsunashima,
  BC 24956 Giampaolo Russo, BC 24958 Aurora Madril Oliveira Molina,
  BC 24959 Diego Alves da Silva Molina, BC 24964 Luana Salzano,
  BC 24970 Tsengelbayar Mendsaikhan, BC 24984 Deva Sofia Onorato,
  BC 24999 Soumaya Bourguiba, BC 25002 + BC 25003 Aleix Cervera Gonzalez,
  BC 25010 Alin Merticariu, BC 25016 Anderson da Silva Martins

FIX RECIPE (NOT YET RUN)

Step 1:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW());

Step 2:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES ('October Bank Holiday', '2026-10-26', '2026-10-26', true, NOW());

Step 3: Review 17 affected courses; for short-course students starting Mon 3 Aug, shift start to Tue 4 Aug if needed.

Step 4 - Confirm:
  SELECT id, name, start_date, end_date, is_paid_holiday FROM school_closures ORDER BY start_date;

RISK: bookings | Reversible: Yes | Blast radius: HIGH (17 courses)

STATUS: CRITICAL - Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC
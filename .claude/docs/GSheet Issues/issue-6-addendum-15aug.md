Issue 6 — Erroneous Mobile Numbers (All Students) — Addendum 15 Aug 2026

Reporter: NM | Area: Overview | Sheet row: 7

SYMPTOM
Student phone_mobile fields contain numbers not in E.164 format — missing + prefix or containing spaces/dashes.

CURRENT STATE (53rd check — Sat 15 Aug 2026 UTC)
  Total students with phone_mobile set:           1,374
  Without + prefix:                                 552  (unchanged from Fri 14 Aug)
  With + prefix but spaces or dashes:               419  (+1 from 418 — likely new student)
  Total non-E.164:                                  971  (+1 from 970)

Day 38 since reported. Fix not applied.

FIX RECIPE (NOT YET RUN)

Step 1: Create backup
  CREATE TABLE students_phone_backup AS
  SELECT id, phone_mobile FROM students WHERE phone_mobile IS NOT NULL;

Step 2: Dry-run previews
  -- No-prefix
  SELECT id, phone_mobile, CONCAT('+', TRIM(phone_mobile)) AS proposed
  FROM students WHERE phone_mobile IS NOT NULL AND phone_mobile <> '' AND phone_mobile NOT LIKE '+%' LIMIT 20;
  -- Space/dash
  SELECT id, phone_mobile, REGEXP_REPLACE(phone_mobile, '[\s\-]', '', 'g') AS proposed
  FROM students WHERE phone_mobile LIKE '+%' AND (phone_mobile ~ ' ' OR phone_mobile ~ '-') LIMIT 20;

Step 3: Apply in a transaction
  BEGIN;
  UPDATE students SET phone_mobile = CONCAT('+', TRIM(phone_mobile))
  WHERE phone_mobile IS NOT NULL AND phone_mobile <> '' AND phone_mobile NOT LIKE '+%';
  -- ~552 rows
  UPDATE students SET phone_mobile = REGEXP_REPLACE(phone_mobile, '[\s\-]', '', 'g')
  WHERE phone_mobile LIKE '+%' AND (phone_mobile ~ ' ' OR phone_mobile ~ '-');
  -- ~419 rows
  SELECT COUNT(*) FROM students WHERE phone_mobile IS NOT NULL AND phone_mobile <> ''
    AND (phone_mobile NOT LIKE '+%' OR phone_mobile ~ ' ' OR phone_mobile ~ '-');
  -- expect 0
  COMMIT;

RISK: reversible (restore from backup); 971 phone fields; no financial/booking impact
STATUS: OPEN — 971 non-E.164 numbers (+1 from yesterday, day 38). Last checked: 2026-08-15 UTC (53rd check)
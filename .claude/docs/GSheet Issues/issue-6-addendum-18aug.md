Issue 6 -- Erroneous mobile numbers (61st check)

Reporter: PG | Area: Overview | Sheet row: 7 | Last checked: 2026-08-18 UTC

Symptom: Student phone_mobile values not in E.164 format.

Root cause (no change):
- 552 students: no + prefix (bare national numbers) -- unchanged
- 419 students: + prefix but spaces or dashes -- unchanged
- Total non-E.164: ~971 (unchanged), total students: 14,473
- Day 45 -- fix not applied

Fix recipe (NOT YET RUN):
1. Dry run: SELECT id, phone_mobile, regexp_replace(regexp_replace(phone_mobile, chr(91) || chr(94) || chr(48) || chr(45) || chr(57) || chr(43) || chr(93), chr(39) || chr(39), chr(39) || chr(103) || chr(39)), chr(39) || chr(94) || chr(48) || chr(48) || chr(39), chr(39) || chr(43) || chr(39)) AS normalized FROM students LIMIT 50;
2. Mass update to strip non-E.164 chars (strip spaces, dashes; replace leading 00 with +)
3. Verify 20 sample records before/after

Risk: Data hygiene: low. Reversible. Blast radius: ~971 rows.

Status: Day 45 -- no change. Fix pending Neil approval. Last checked: 2026-08-18 UTC (61st check)
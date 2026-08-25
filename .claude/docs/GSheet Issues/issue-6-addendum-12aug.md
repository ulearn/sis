Issue 6 - Non-E.164 Mobile Numbers (44th check, 12 Aug 2026)

Reporter: PG | Sheet row: 7

Root cause:
- Total with mobile: 1372 | Without + prefix: 552 | With + but spaces: 414 | Total non-E.164: 966 (70%)
- Day 31 - fix not applied

Fix recipe (NOT YET RUN):
UPDATE students SET phone_mobile = REPLACE(phone_mobile, ' ', '') WHERE phone_mobile LIKE '+%' AND phone_mobile LIKE '% %';
-- 552 without + prefix: manual review before any update

Risk: data-hygiene | Reversible: yes | Blast radius: up to 966 records

Status: Open - 966 non-E.164, day 31. Last checked: 2026-08-12 UTC (44th check)
# Issue 6 — Erroneous Mobile Phone Numbers (20th check)

Reporter: (overview) | Area: Overview | Sheet row: 7

## Status: Fri 31 Jul 2026 UTC — all 6 phones unchanged; hash change is whitespace artefact

| Student ID | Name | Phone value | Problem | Days stale |
|-----------|------|------------|---------|-----------|
| 1194 | Jieun Lee | 00821097366523 (home contry) | Annotation in parens | 85 |
| 1897 | Dolgormaa Bayaraa | saraa.tpb@gmail.com | Email in phone field | 14 |
| 5345 | Lisa Li | 0864645297 (Husband) | Annotation in parens | 112 |
| 8567 | Aki Miura | aki-hinaaki1116@ezudo.he.jp | Email in phone field | 112 |
| 10343 | Alessandra Saito de Araujo | +353 (83) 885 9162 + invisible Unicode RTL | Unicode appended | 94 |
| 14556 | Theodore Bolt | +1 (984) 389-3888 | US format; record touched Fri Jul 31 09:33 UTC unchanged |

Note: Bolt (14556) updated today 09:33 UTC but phone value unchanged. Others bulk-touched Jul 28.

## Fix recipe (NOT YET RUN)

Strip annotations:
  UPDATE students SET phone_mobile='00821097366523', updated_at=NOW() WHERE id=1194;
  UPDATE students SET phone_mobile='0864645297', updated_at=NOW() WHERE id=5345;

Strip trailing Unicode:
  UPDATE students SET phone_mobile=regexp_replace(phone_mobile,'[^\x00-\x7F]','','g'), updated_at=NOW() WHERE id=10343;

For students 1897, 8567, 14556: verify correct number in HubSpot first, then update.

## Risk: Data hygiene, cosmetic. Reversible. 6 students.
## Last checked: Fri 31 Jul 2026 UTC (20th check)

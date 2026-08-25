# Issue 6 — Erroneous Mobile Numbers (29th check Wed 5 Aug 2026 UTC)
Reporter: PG | Area: Overview | Sheet row: 7

Symptom: phoneMobile fields with text annotations, local-format numbers, or missing country codes.

Root Cause (verified 2026-08-05 UTC, 29th check):
Unchanged. New entry updated 2026-08-04:
- Student 979 Monica Breier Fiametti: 083 4891303 — Irish local format, no country code

Persistent bad entries:
- Student 14615 Edgar Gilabert Mata: +34667755221 (mother) — text annotation
- Student 14556 Theodore Bolt: +1 (984) 389-3888 — US format
- Student 1194 Jieun Lee: 00821097366523 (home contry) — annotation
- Student 10343 Alessandra Saito de Araujo: +353 (83) 885 9162 — invisible RTL marks

975 total non-E.164 students (includes legacy/inactive with spaced international numbers).
Truly erroneous (text / missing country code): ~7+ active students.

Fix Recipe (NOT YET RUN):
  UPDATE student SET phone_mobile = '+353834891303' WHERE id = 979;
  UPDATE student SET phone_mobile = '+34667755221' WHERE id = 14615;
  UPDATE student SET phone_mobile = '+19843893888' WHERE id = 14556;
  UPDATE student SET phone_mobile = '+821097366523' WHERE id = 1194;
  UPDATE student SET phone_mobile = '+353838859162' WHERE id = 10343;

Risk: data-hygiene | Reversible: yes | Blast radius: 5 students
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (29th check) | Day 20
See also: issue-6-addendum-5aug.md
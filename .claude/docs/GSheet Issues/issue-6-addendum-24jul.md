# Issue 6 — Erroneous Mobile Phone Numbers
Reporter: NM | Area: Overview | Sheet row: 7

## Root Cause (Fri 24 Jul 2026 UTC — 80th check, 144th total — UNCHANGED)
- Student 1897 (Dolgormaa Bayaraa): saraa.tpb@gmail.com in phone field — last touched 17 Jul 2026, 7 days unchanged
- Student 8567 (Aki Miura): aki-hinaaki1116@ezudo.he.jp in phone field — 105 days
- Student 1194 (Jieun Lee): annotation "00821097366523 (home contry)" in phone field — 78 days
- Student 5345 (Lisa Li): annotation "0864645297 (Husband)" in phone field — 105 days
- Student 10343 (Alessandra Saito de Araujo): Unicode trailing chars in phone field — 87 days

## Fix (NOT YET RUN)
UPDATE Student SET phoneMobile=trim-annotation, updatedAt=NOW() WHERE id IN (1194, 5345);
UPDATE Student SET phoneMobile=strip-unicode, updatedAt=NOW() WHERE id=10343;
Get real phones from HubSpot for students 1897 and 8567.

## Risk: Data hygiene — LOW. 5 students. Reversible.
## Status: UNCHANGED — 5 phones still wrong. Fix NOT RUN. Fri 24 Jul 2026 UTC

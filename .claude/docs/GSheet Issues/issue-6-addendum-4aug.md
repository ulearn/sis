# Issue 6 — Erroneous Phone Numbers (27th check Tue 4 Aug 2026 UTC)
Reporter: PG | Area: Overview | Sheet row: 7

## Root Cause (confirmed 2026-08-04 UTC — all 6 unchanged)
- Student 1194 Jieun Lee: phone_mobile="00821097366523 (home contry)" — phone + annotation; updated 2026-07-28
- Student 1897 Dolgormaa Bayaraa: phone_mobile="saraa.tpb@gmail.com" — email in phone field; updated 2026-07-28
- Student 5345 Lisa Li: phone_mobile="0864645297 (Husband)" — phone + annotation; updated 2026-07-28
- Student 8567 Aki Miura: phone_mobile="aki-hinaaki1116@ezudo.he.jp" — email in phone field; updated 2026-07-28
- Student 10343 Alessandra Saito de Araujo: "+353 (83) 885 9162" + invisible Unicode RTL marks; updated 2026-07-28
- Student 14556 Theodore Bolt: "+1 (984) 389-3888" — US format; updated 2026-07-31

## Fix Recipe (NOT YET RUN)
UPDATE students SET phone_mobile='00821097366523' WHERE id=1194;  -- strip annotation
UPDATE students SET phone_mobile='+353 83 885 9162' WHERE id=10343;  -- strip RTL
UPDATE students SET phone_mobile='0864645297' WHERE id=5345;  -- strip annotation
-- Students 1897+8567: check HubSpot for correct mobile, then clear if not found:
UPDATE students SET phone_mobile=NULL WHERE id IN (1897,8567);
-- Student 14556: verify with Neil if US number is correct; may be valid, no action needed.

## Risk: data-hygiene | Reversible: yes | 6 students, cosmetic

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (27th check)
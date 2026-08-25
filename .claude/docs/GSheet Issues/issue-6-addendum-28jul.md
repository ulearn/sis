# Issue 6 — Erroneous Mobile Numbers (Addendum 28 Jul 2026)
Reporter: Staff. Area: Student data. Sheet row 7.
Last checked: Tue 28 Jul 2026 UTC (111th hourly run).

## Symptom
Six student phone_mobile fields contain invalid data.

## Root cause (fresh Tue 28 Jul 2026)
All 6 unchanged:
- Student 1897 Dolgormaa Bayaraa: saraa.tpb@gmail.com in phone field — 11d (updated 17 Jul)
- Student 8567 Aki Miura: aki-hinaaki1116@ezudo.he.jp in phone field — 109d (updated 10 Apr)
- Student 1194 Jieun Lee: "00821097366523 (home contry)" in phone field — 82d (updated 7 May)
- Student 5345 Lisa Li: "0864645297 (Husband)" in phone field — 109d (updated 10 Apr)
- Student 10343 Alessandra Saito: +353 (83) 885 9162 with Unicode trailing chars — 91d (updated 28 Apr)
- Student 14556 Theodore Bolt: +1 (984) 389-3888 — 5d (updated 23 Jul). Area code 984 valid US NC; verify via HubSpot.

## Fix recipe (NOT YET RUN)
1. Strip annotation: UPDATE students SET phone_mobile = '00821097366523', updated_at = NOW() WHERE id = 1194;
2. Strip annotation: UPDATE students SET phone_mobile = '0864645297', updated_at = NOW() WHERE id = 5345;
3. Strip Unicode: UPDATE students SET phone_mobile = '+353 83 885 9162', updated_at = NOW() WHERE id = 10343;
4. Verify 1897 via HubSpot; replace email with correct phone.
5. Verify 8567 via HubSpot; replace email with correct phone.
6. Verify 14556 via HubSpot; reformat if needed.

## Risk
Data hygiene. Low risk. Reversible. Previous: issue-6-addendum-27jul.md.
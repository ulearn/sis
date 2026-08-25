Issue 6 - Erroneous Mobile Numbers (26th check Mon 3 Aug 2026 UTC, 2nd today)
Reporter: PG | Area: Overview | Sheet row: 7


ROOT CAUSE (fresh 3 Aug 2026 UTC, all 6 unchanged):
- Student 14556 Theodore Bolt: +1 (984) 389-3888 - US format; last updated 31 Jul (may be intentional)
- Student 1897 Dolgormaa Bayaraa: saraa.tpb@gmail.com - email address in phone_mobile field
- Student 8567 Aki Miura: aki-hinaaki1116@ezudo.he.jp - email address in phone_mobile field
- Student 1194 Jieun Lee: 00821097366523 (home contry) - phone number + annotation text
- Student 5345 Lisa Li: 0864645297 (Husband) - phone number + annotation text
- Student 10343 Alessandra Saito de Araujo: +353 (83) 885 9162 + invisible Unicode RTL marks (U+202C)


FIX RECIPE (NOT YET RUN - confirm correct values with HubSpot first):
  UPDATE students SET phone_mobile = NULL WHERE id = 1897;
  UPDATE students SET phone_mobile = NULL WHERE id = 8567;
  UPDATE students SET phone_mobile = '00821097366523' WHERE id = 1194;
  UPDATE students SET phone_mobile = '0864645297' WHERE id = 5345;
  UPDATE students SET phone_mobile = '+353 83 885 9162' WHERE id = 10343;
  Student 14556 Bolt: verify if US number is correct before changing.


RISK: data-hygiene | Reversible: yes | Blast: 6 students (cosmetic)
STATUS: 26th check Mon 3 Aug 2026 UTC (2nd today). All 6 unchanged. NOT YET RUN.
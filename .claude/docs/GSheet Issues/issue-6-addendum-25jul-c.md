Issue 6 -- Erroneous Mobile Numbers (addendum Sat 25 Jul 2026 UTC, 91st hourly run)

Sheet row: 7 | Area: Overview | Reporter: PG

Status: OPEN -- 5 confirmed bad numbers unchanged. Theodore Bolt (14556) likely valid US format.

Current DB state (all unchanged since 90th run):

  Student 1897 Dolgormaa Bayaraa:           saraa.tpb@gmail.com in phone field (8d, updated Jul 17)
  Student 8567 Aki Miura:                   aki-hinaaki1116@ezudo.he.jp in phone field (106d, updated Apr 10)
  Student 1194 Jieun Lee:                   00821097366523 (home contry) in phone field (79d, updated May 7)
  Student 5345 Lisa Li:                     0864645297 (Husband) in phone field (106d, updated Apr 10)
  Student 10343 Alessandra Saito de Araujo: +353 (83) 885 9162 + Unicode trailing chars (88d, updated Apr 28)
  Student 14556 Theodore Bolt:              +1 (984) 389-3888 (2d, updated Jul 23) -- likely valid US, area code 984 = NC

Why B/F/G hash changed:
  Sheet columns B/F/G were edited between the 90th and 91st runs. Underlying data unchanged.

Fix Recipe (NOT YET RUN):
  Step 1 -- Get correct phone numbers from HubSpot for students 1897 and 8567.
  Step 2 -- Clean up 5 confirmed bad entries:
    UPDATE students SET phone_mobile = '00821097366523' WHERE id = 1194;
    UPDATE students SET phone_mobile = '0864645297' WHERE id = 5345;
    UPDATE students SET phone_mobile = '+353 (83) 885 9162' WHERE id = 10343;
  Step 3 -- Verify Theodore Bolt (14556).

Risk: Low. Data-hygiene. Reversible. 5-6 rows.

Last checked: Sat 25 Jul 2026 UTC (91st hourly run) -- data unchanged from 90th run.
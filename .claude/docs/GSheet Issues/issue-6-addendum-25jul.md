# Issue 6 -- Erroneous Mobile Numbers -- Addendum 25 Jul 2026

Reporter: PG | Area: Overview | Sheet row: 7
Checked: Sat 25 Jul 2026 UTC -- 83rd hourly check, 161st total run (expanded filter)

## CURRENT STATUS -- 5 CORE BAD PHONES; 15 AMBIGUOUS INTERNATIONAL FORMAT

CORE 5 bad phones (unchanged from previous reports):
- Student 1897 Dolgormaa Bayaraa: email saraa.tpb@gmail.com in phone field -- 8 days
- Student 8567 Aki Miura: email aki-hinaaki1116@ezudo.he.jp in phone field -- 106 days
- Student 1194 Jieun Lee: annotation 00821097366523 (home contry) -- 79 days
- Student 5345 Lisa Li: annotation 0864645297 (Husband) -- 106 days
- Student 10343 Alessandra Saito de Araujo: Unicode trailing chars in phone -- 88 days

EXPANDED FILTER (broader parenthesis check) flags 15 additional phones:
These all appear to be VALID international format numbers with area codes in parens,
e.g. +353 (83) 163 5745 or +55 (11) 99688-3438. Likely NOT errors.
Students: 767, 6495, 7296, 7439, 9382, 4876, 5167, 5971, 6472, 7712, 5363, 5957, 4942, 4941

NEW FLAG (1 day old):
- Student 14556 Theodore Bolt: +1 (984) 389-3888 -- looks like valid US format (area code 984).
  Check HubSpot to confirm if real number.

## FIX RECIPE (NOT YET RUN)

Step 1 -- Fix student 1194 (Jieun Lee): strip annotation from phone.
  UPDATE students SET phone_mobile = 00821097366523 WHERE id = 1194
  Or set from HubSpot contact.

Step 2 -- Fix student 5345 (Lisa Li): strip annotation from phone.
  UPDATE students SET phone_mobile = 0864645297 WHERE id = 5345
  (or get real number from HubSpot)

Step 3 -- Fix student 10343 (Alessandra): strip trailing Unicode chars from phone.
  UPDATE students SET phone_mobile = +353838859162 WHERE id = 10343

Step 4 -- Fix students 1897 and 8567: replace email with real mobile from HubSpot.
  Check HubSpot contacts for Dolgormaa Bayaraa and Aki Miura, get mobile numbers.

Step 5 -- Verify student 14556 Theodore Bolt via HubSpot (probably OK).

Step 6 -- Optionally: normalise international format for 14 ambiguous numbers (not urgent).

## RISK / CATEGORY

data-hygiene | Reversible: Yes | Blast radius: 5-6 student records

## STATUS

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC
Core 5 unchanged. 15 ambiguous (probably valid format). 1 new low-priority flag.
Issue 6 Addendum -- Erroneous Mobile Numbers (25 Jul 2026, run d)

Reporter: PG | Area: Overview | Sheet row: 7
Last checked: 2026-07-25 UTC (101st hourly run)

Status: UNCHANGED -- all 6 students still have bad/suspect phone data

  Student 1897  Dolgormaa Bayaraa:          saraa.tpb@gmail.com                   | 8 days  (Jul 17) | Email in phone field
  Student 8567  Aki Miura:                  aki-hinaaki1116@ezudo.he.jp           | 106 days (Apr 10) | Email in phone field
  Student 1194  Jieun Lee:                  00821097366523 (home contry)          | 79 days (May 7)  | Annotation in phone field
  Student 5345  Lisa Li:                    0864645297 (Husband)                  | 106 days (Apr 10) | Annotation in phone field
  Student 10343 Alessandra Saito de Araujo: +353 (83) 885 9162 [U+202C x2]       | 88 days (Apr 28) | Trailing Unicode chars
  Student 14556 Theodore Bolt:              +1 (984) 389-3888                     | 2 days  (Jul 23) | Likely valid US -- verify HubSpot

Fix Recipe (NOT YET RUN)

Step 1 -- Strip annotations (students 1194, 5345)
  UPDATE student SET "phoneMobile" = '00821097366523' WHERE id = 1194;
  UPDATE student SET "phoneMobile" = '0864645297' WHERE id = 5345;

Step 2 -- Strip Unicode trailing chars (student 10343)
  UPDATE student SET "phoneMobile" = '+353 (83) 885 9162' WHERE id = 10343;

Step 3 -- Get real numbers from HubSpot (students 1897, 8567)
  Search HubSpot for Dolgormaa Bayaraa (1897) and Aki Miura (8567); copy mobilephone field.
  UPDATE student SET "phoneMobile" = <hs_value> WHERE id = 1897;
  UPDATE student SET "phoneMobile" = <hs_value> WHERE id = 8567;

Step 4 -- Verify student 14556 (Theodore Bolt)
  +1 (984) 389-3888 = area code 984 (Raleigh-Durham NC). Check HubSpot -- likely valid, no action needed.

Risk: Data hygiene. Low blast radius. Reversible.
Status: Open -- 5 confirmed bad records (106d max). Student 14556 pending verification.

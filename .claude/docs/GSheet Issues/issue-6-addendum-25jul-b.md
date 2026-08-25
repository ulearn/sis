# Issue 6 -- Erroneous Mobile Numbers (addendum Sat 25 Jul 2026 UTC, 90th hourly run)

Sheet row: 7 | Area: Overview | Reporter: PG

Confirmed bad numbers (5 -- all unchanged)
  Student 1897 - Dolgormaa Bayaraa:           saraa.tpb@gmail.com (8 days)
  Student 8567 - Aki Miura:                   aki-hinaaki1116@ezudo.he.jp (106 days)
  Student 1194 - Jieun Lee:                   00821097366523 (home contry) (79 days)
  Student 5345 - Lisa Li:                     0864645297 (Husband) (106 days)
  Student 10343 - Alessandra Saito de Araujo: +353 (83) 885 9162 + Unicode trailing chars (88 days)

Student 14556 Theodore Bolt -- likely NOT an error
Phone: +1 (984) 389-3888 (updated Jul 23 -- 2 days old)
Format +1 (area code) XXX-XXXX is standard US notation. Area code 984 = Raleigh-Durham NC.
Recommendation: verify against HubSpot contact for student 14556 -- if it matches, no action needed.

Fix recipe (NOT YET RUN)

Step 1 -- Fix confirmed bad numbers (get correct values from HubSpot for students 1897 and 8567 first):
  UPDATE "Student" SET "phoneMobile" = '00821097366523' WHERE id = 1194;  -- strip annotation (home contry)
  UPDATE "Student" SET "phoneMobile" = '0864645297' WHERE id = 5345;      -- strip annotation (Husband)
  UPDATE "Student" SET "phoneMobile" = '+353 (83) 885 9162' WHERE id = 10343; -- strip Unicode trailing chars
  -- Students 1897 and 8567: fetch correct phone from HubSpot contacts before updating

Step 2 -- Verify Theodore Bolt (14556)
  Check HubSpot contact -- if phone matches +1 (984) 389-3888, mark resolved.

Risk / category
Low. Category: data-hygiene. Reversible. 5-6 students only.

Status
OPEN -- 5 confirmed bad numbers unchanged. Theodore Bolt likely valid (verify HubSpot).

Last checked: Sat 25 Jul 2026 UTC (90th hourly run)
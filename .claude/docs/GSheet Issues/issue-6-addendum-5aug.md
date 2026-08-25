Issue 6 - Erroneous Phone Numbers (28th check Wed 5 Aug 2026 UTC)
Reporter: PG | Area: Overview | Sheet row: 7

Root Cause (confirmed 2026-08-05 UTC)

New entry: Student 14615 Edgar Gilabert Mata: +34667755221 (mother) - appended text, updated 2026-08-04T08:50 UTC.
This was missed by the 27th check (ran ~02:00 UTC yesterday) since Edgar was updated at 08:50 UTC.

Previously tracked 6 phones (unchanged):
- Student 1194 Jieun Lee: 00821097366523 (home contry) - annotation in phone field
- Student 1897 Dolgormaa Bayaraa: email in phone field (not in todays query - may already fixed)
- Student 5345 Lisa Li: 0864645297 (Husband) - annotation in phone field
- Student 8567 Aki Miura: email in phone field (not in todays query - may already fixed)
- Student 10343 Alessandra Saito de Araujo: +353 (83) 885 9162 + invisible RTL marks
- Student 14556 Theodore Bolt: +1 (984) 389-3888 - US format

Broader query returns 21 total students with non-E.164 formatting (many legacy/inactive).

Fix Recipe (NOT YET RUN)

1. Edgar Gilabert Mata (active current student, priority):
   UPDATE student SET phone_mobile = "+34667755221" WHERE id = 14615;

2. Jieun Lee + Lisa Li (annotations appended):
   UPDATE student SET phone_mobile = "+821097366523" WHERE id = 1194;
   UPDATE student SET phone_mobile = "0864645297" WHERE id = 5345;
   -- Note: verify Lisa Li prefix with Neil

3. Dolgormaa (1897) + Aki Miura (8567) - if still present in DB:
   UPDATE student SET phone_mobile = NULL WHERE id IN (1897, 8567);
   Then set correct mobile from HubSpot contact.

4. Alessandra (10343) - strip RTL marks:
   UPDATE student SET phone_mobile = "+353838859162" WHERE id = 10343;

5. Remaining 16 students with formatting-only issues: no change strictly required.
   Decision for Neil.

Risk: data-hygiene | Reversible: yes | Blast radius: phone_mobile field only
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (28th check)
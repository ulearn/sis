Issue 6 - Erroneous Mobile Numbers (Addendum 26 Jul 2026)

Reporter: NM | Area: Overview | Sheet row: 7

Root cause (fresh data 26 Jul 2026 UTC) - 5 confirmed bad records unchanged:
- 1897 Dolgormaa Bayaraa: phone_mobile = saraa.tpb@gmail.com (9 days, email stored, updated Jul 17)
- 8567 Aki Miura: phone_mobile = aki-hinaaki1116@ezudo.he.jp (107 days, email stored)
- 1194 Jieun Lee: phone_mobile = 00821097366523 (home contry) (80 days, annotation)
- 5345 Lisa Li: phone_mobile = 0864645297 (Husband) (107 days, annotation)
- 10343 Alessandra Saito de Araujo: +353 (83) 885 9162 + Unicode trailing chars (89 days)

1 to verify:
- 14556 Theodore Bolt: +1 (984) 389-3888 (3 days, likely valid US number, area code 984 = Raleigh-Durham NC)

Fix recipe (NOT YET RUN):
1. Verify Theodore Bolt 14556 via HubSpot (confirm +1 (984) 389-3888 is real)
2. Get real numbers for 1897, 8567 from HubSpot contacts
3. UPDATE students SET phone_mobile = 00821097366523 WHERE id = 1194; -- strip annotation
4. UPDATE students SET phone_mobile = 0864645297 WHERE id = 5345; -- strip annotation
5. UPDATE students SET phone_mobile = +353 (83) 885 9162 WHERE id = 10343; -- strip Unicode
6. After HubSpot: UPDATE students SET phone_mobile = <real> WHERE id IN (1897, 8567);

Risk/Category: data-hygiene, reversible; urgency: low

Status: OPEN - Fix NOT RUN.
Last checked: 26 Jul 2026 UTC (108th hourly run)
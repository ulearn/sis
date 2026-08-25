Issue 6 - Erroneous Mobile Numbers (112th check, 29 Jul 2026)

Reporter: PG | Area: Data Hygiene | Sheet row: 7

Root cause (live check Wed 29 Jul 2026 UTC)
All 6 problematic entries unchanged from yesterday:
- Student 1897 Dolgormaa Bayaraa: saraa.tpb@gmail.com in phone field (12 days, updated 17 Jul)
- Student 8567 Aki Miura: aki-hinaaki1116@ezudo.he.jp in phone field (110 days, updated 10 Apr)
- Student 1194 Jieun Lee: annotation 00821097366523 (home country) in phone field (83 days, updated 7 May)
- Student 5345 Lisa Li: annotation 0864645297 (Husband) in phone field (110 days, updated 10 Apr)
- Student 10343 Alessandra Saito de Araujo: Unicode trailing chars after +353 (83) 885 9162 (92 days, updated 28 Apr)
- Student 14556 Theodore Bolt: +1 (984) 389-3888 US NC area code (6 days, updated 23 Jul) - verify via HubSpot

Fix recipe (NOT YET RUN)
UPDATE Student SET phoneMobile=X, updatedAt=NOW() WHERE id=1194; -- X=00821097366523
UPDATE Student SET phoneMobile=X, updatedAt=NOW() WHERE id=5345;  -- X=0864645297
UPDATE Student SET phoneMobile=X, updatedAt=NOW() WHERE id=10343; -- X=+353 (83) 885 9162 (strip Unicode)
For 1897 and 8567: look up correct phone via HubSpot first, then update.
For 14556: verify US number via HubSpot before any action.

Risk: Data hygiene - low blast radius; reversible.
Status: Unchanged - Fix NOT RUN.
Last checked: 2026-07-29 UTC
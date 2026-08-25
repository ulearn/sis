Issue 6 - Erroneous Mobile Numbers
Reporter: PG | Sheet row: 7
Last checked: 2026-07-30 UTC (113th check)

Root cause (NOT YET RUN):
6 students with erroneous phoneMobile values, all unchanged:
- Student 1897 Dolgormaa Bayaraa: saraa.tpb@gmail.com - email in phone field (13 days stale)
- Student 8567 Aki Miura: aki-hinaaki1116@ezudo.he.jp - email in phone field (111 days stale)
- Student 1194 Jieun Lee: 00821097366523 (home contry) - annotation in phone field (84 days stale)
- Student 5345 Lisa Li: 0864645297 (Husband) - annotation in phone field (111 days stale)
- Student 10343 Alessandra Saito de Araujo: +353 (83) 885 9162 with Unicode trailing chars (93 days stale)
- Student 14556 Theodore Bolt: +1 (984) 389-3888 - US NC area code, verify correct (7 days stale)

Fix recipe (NOT YET RUN):
Students 1194 and 5345 - strip annotations:
  UPDATE students SET phone_mobile=00821097366523,updated_at=NOW() WHERE id=1194;
  UPDATE students SET phone_mobile=0864645297,updated_at=NOW() WHERE id=5345;
Student 10343 - strip Unicode trailing chars (two U+202C after number):
  UPDATE students SET phone_mobile=+353 (83) 885 9162,updated_at=NOW() WHERE id=10343;
Students 1897 and 8567 - get correct phones from HubSpot first, then:
  UPDATE students SET phone_mobile=CORRECT_PHONE,updated_at=NOW() WHERE id IN (1897,8567);
Student 14556 - verify Theodore Bolt in HubSpot; if +1 (984) 389-3888 confirmed correct, no action needed.

Risk: data-hygiene. Reversible. Blast radius: 6 students, no financial impact.
Status: NOT YET RUN - awaiting Neil approval. Last checked: 2026-07-30 UTC.
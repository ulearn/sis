Issue 6 - Phone Errors (22nd check 31 Jul 2026)
All 6 phones unchanged from DB check at 31 Jul 2026 UTC.
Student 14556 (Theodore Bolt): +1 (984) 389-3888 -- US format -- touched today 09:33 UTC, still wrong
Student 1897 (Dolgormaa Bayaraa): saraa.tpb@gmail.com -- email in phone -- 15d stale
Student 8567 (Aki Miura): aki-hinaaki1116@ezudo.he.jp -- email in phone -- 113d stale
Student 1194 (Jieun Lee): 00821097366523 (home contry) -- annotation -- 86d stale
Student 5345 (Lisa Li): 0864645297 (Husband) -- annotation -- 113d stale
Student 10343 (Alessandra Saito de Araujo): +353 (83) 885 9162 + invisible RTL -- 95d stale

Fix recipe - NOT YET RUN:
Backup: SELECT id, phone_mobile FROM students WHERE id IN (14556,1897,8567,1194,5345,10343);
UPDATE students SET phone_mobile = '+19843893888' WHERE id = 14556;
UPDATE students SET phone_mobile = NULL WHERE id = 1897; -- check HubSpot for real number first
UPDATE students SET phone_mobile = NULL WHERE id = 8567; -- check HubSpot for real number first
UPDATE students SET phone_mobile = '00821097366523' WHERE id = 1194;
UPDATE students SET phone_mobile = '0864645297' WHERE id = 5345;
UPDATE students SET phone_mobile = regexp_replace(phone_mobile, '[^ -~]', '', 'g') WHERE id = 10343;
Risk: data-hygiene. Reversible. Last checked: 2026-07-31 UTC (22nd check)
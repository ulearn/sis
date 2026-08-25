Issue 6 - Erroneous Phone Numbers - Addendum 27 Jul 2026

Reporter: PG | Area: Overview | Sheet row: 7 | Last checked: 2026-07-27 UTC

Root Cause (fresh DB 2026-07-27)

Core 5 erroneous phones unchanged:
1. Student 1897 Dolgormaa Bayaraa: phone=saraa.tpb@gmail.com (email, 10 days)
2. Student 8567 Aki Miura: phone=aki-hinaaki1116@ezudo.he.jp (email, 108 days)
3. Student 1194 Jieun Lee: phone=00821097366523 (home country) (annotation, 81 days)
4. Student 5345 Lisa Li: phone=0864645297 (Husband) (annotation, 108 days)
5. Student 10343 Alessandra Saito de Araujo: Unicode trailing chars after +353 (83) 885 9162 (90 days)
6. Student 14556 Theodore Bolt: phone=+1 (984) 389-3888 (updated 23 Jul) - valid US NC area code; HubSpot not accessible headless (permission denied); verify manually.

Fix Recipe (NOT YET RUN)

  UPDATE students SET phone_mobile='<from HubSpot>', updated_at=NOW() WHERE id=1897;
  UPDATE students SET phone_mobile='<from HubSpot>', updated_at=NOW() WHERE id=8567;
  UPDATE students SET phone_mobile='00821097366523', updated_at=NOW() WHERE id=1194;
  UPDATE students SET phone_mobile='0864645297', updated_at=NOW() WHERE id=5345;
  UPDATE students SET phone_mobile=regexp_replace(phone_mobile, '[^\x20-\x7E]', '', 'g'), updated_at=NOW() WHERE id=10343;
  -- For student 14556: verify HubSpot first; if same number, no fix needed.

Risk: data-hygiene. Reversible: yes. 6 students, phone field only.

Status: OPEN - 5 erroneous (81-108 days), 14556 pending HubSpot verification. Fix NOT RUN. Last checked: 2026-07-27 UTC

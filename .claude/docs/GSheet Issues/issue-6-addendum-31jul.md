# Issue 6 — Erroneous Mobile Phone Numbers (19th check)

Reporter: (overview) · Area: Overview · Sheet row: 7

## Root cause (31 Jul 2026)

6 students — all unchanged:
- Student 1194 Jieun Lee: "00821097366523 (home contry)" — annotation in parens, 85 days
- Student 1897 Dolgormaa Bayaraa: "saraa.tpb@gmail.com" — email in phone field, 14 days
- Student 5345 Lisa Li: "0864645297 (Husband)" — annotation in parens, 112 days
- Student 8567 Aki Miura: "aki-hinaaki1116@ezudo.he.jp" — email in phone field, 112 days
- Student 10343 Alessandra Saito de Araujo: "+353 (83) 885 9162" with invisible Unicode chars appended, 94 days
- Student 14556 Theodore Bolt: "+1 (984) 389-3888" — US format, verify vs HubSpot, 8 days

## Fix recipe (NOT YET RUN)

Strip annotations on 1194 and 5345 (NOT YET RUN):
  UPDATE students SET phone_mobile='00821097366523', updated_at=NOW() WHERE id=1194;
  UPDATE students SET phone_mobile='0864645297', updated_at=NOW() WHERE id=5345;

Strip trailing Unicode on 10343 (NOT YET RUN):
  UPDATE students SET phone_mobile=regexp_replace(phone_mobile,'[^\x00-\x7F]','','g'), updated_at=NOW() WHERE id=10343;

For 1897, 8567, 14556: verify correct number in HubSpot first, then update.

## Risk: Data hygiene, cosmetic. Reversible. 6 students.
## Status: OPEN — fix NOT RUN — Last checked: Fri 31 Jul 2026 UTC (19th check)

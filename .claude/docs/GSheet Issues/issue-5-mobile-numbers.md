Issue 6 (sheet row 7) — Erroneous Mobile Numbers

Reporter: NM | Area: Overview | Sheet row: 7 | Check: updated 17 Jul 2026

---

Symptom: Students have wrong content in mobile phone field.

Root cause — fresh DB 17 Jul 2026

5 students with bad phone data (all UNCHANGED since original detection):

1. Student 1897 (Dolgormaa Bayaraa): phoneMobile = "saraa.tpb@gmail.com" (email address, not phone)
   Last changed: ~28 Apr 2026 (80 days stale)

2. Student 8567 (Aki Miura): phoneMobile = "aki-hinaaki1116@ezudo.he.jp" (email address, not phone)
   Last changed: ~10 Apr 2026 (98 days stale)

3. Student 1194 (Jieun Lee): phoneMobile = "00821097366523 (home contry)" (annotation in field)
   Last changed: ~7 May 2026 (71 days stale)

4. Student 5345 (Lisa Li): phoneMobile = "0864645297 (Husband)" (annotation in field)
   Last changed: ~10 Apr 2026 (98 days stale)

5. Student 10343 (Alessandra Saito de Araujo): phoneMobile = "+353 (83) 885 9162" + trailing Unicode RTL marks
   Last changed: ~28 Apr 2026 (80 days stale)

---

Fix recipe — NOT YET RUN

1. Students 1194 and 5345 — strip annotations (real number is present):
   UPDATE "Student" SET phone_mobile = '00821097366523' WHERE id = 1194;
   UPDATE "Student" SET phone_mobile = '0864645297' WHERE id = 5345;

2. Student 10343 — strip Unicode RTL marks:
   UPDATE "Student" SET phone_mobile = '+353838859162' WHERE id = 10343;
   (verify exact clean number — strip spaces + RTL marks, check format)

3. Students 1897 (Dolgormaa) and 8567 (Aki) — email in phone field:
   Check HubSpot contact for real mobile number before updating.
   UPDATE "Student" SET phone_mobile = '<real_number>' WHERE id = 1897;
   UPDATE "Student" SET phone_mobile = '<real_number>' WHERE id = 8567;
   If HubSpot also has no mobile, set phone_mobile = null.

Risk: data-hygiene | Low risk | All reversible | 5 students

Status: Open — NOT YET RUN. Low urgency.
Last checked: Friday 17 July 2026 UTC (98 days stale worst case)
---
Sun 19 Jul 2026 UTC fresh check

All 5 phone issues CONFIRMED UNCHANGED (fresh DB, Sun 19 Jul).
Student 1897 (Dolgormaa Bayaraa): phone = saraa.tpb@gmail.com (email in phone field). Note: record touched 17 July 2026 (updatedAt=2026-07-17) but phone field is still wrong.
Student 8567 (Aki Miura): phone = aki-hinaaki1116@ezudo.he.jp (email in phone field) — 99 days unchanged (updatedAt=Apr10).
Student 1194 (Jieun Lee): phone = 00821097366523 (home contry) annotation — 72 days unchanged.
Student 5345 (Lisa Li): phone = 0864645297 (Husband) annotation — 99 days unchanged.
Student 10343 (Alessandra Saito de Araujo): phone = +353 (83) 885 9162 with trailing Unicode right-to-left marks — 81 days unchanged.
Fix NOT Run. Last checked: Sun 19 Jul 2026 UTC.

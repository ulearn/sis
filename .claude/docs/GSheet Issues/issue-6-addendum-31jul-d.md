Issue 6 Addendum  31 Jul 2026 (d)  Phone Number Cleanup: All 6 Unchanged
Reporter: Neil  Area: Overview  Sheet row: 7
Last checked: 2026-07-31 UTC (23rd hourly check)

CURRENT DB STATE (this run)
- Student 14556 (Theodore Bolt): +1 (984) 389-3888 -- US format in phone_mobile (unchanged)
- Student 1897 (Dolgormaa Bayaraa): saraa.tpb@gmail.com -- email in phone_mobile, 15+ days stale
- Student 8567 (Aki Miura): email aki-hinaaki1116@ezudo.he.jp in phone_mobile
- Student 1194 (Jieun Lee): 00821097366523 (home country annotation) in phone_mobile, 86+ days stale
- Student 5345 (Lisa Li): 0864645297 (Husband annotation) in phone_mobile, 113+ days stale
- Student 10343 (Alessandra Saito de Araujo): invisible Unicode RTL chars in phone_mobile, 95+ days stale
All 6 unchanged.

FIX RECIPE (NOT YET RUN)

Step 1 -- Jieun Lee (s1194): remove annotation, keep number
  UPDATE students SET phone_mobile = '00821097366523' WHERE id = 1194;

Step 2 -- Lisa Li (s5345): remove Husband annotation, keep number
  UPDATE students SET phone_mobile = '0864645297' WHERE id = 5345;

Step 3 -- Theodore Bolt (s14556): fix to E.164 or clear
  UPDATE students SET phone_mobile = '+19843893888' WHERE id = 14556;
  (Or SET phone_mobile = NULL and ask student to re-enter via portal.)

Step 4 -- Dolgormaa Bayaraa (s1897): clear email from phone field
  UPDATE students SET phone_mobile = NULL WHERE id = 1897;

Step 5 -- Aki Miura (s8567): clear email from phone field
  UPDATE students SET phone_mobile = NULL WHERE id = 8567;

Step 6 -- Alessandra Saito de Araujo (s10343): strip invisible Unicode
  UPDATE students SET phone_mobile = regexp_replace(phone_mobile, '[‏‎‫‪]+', '', 'g') WHERE id = 10343;

RISK / CATEGORY
- Category: data-hygiene
- Reversible: yes (set any value back)
- Blast radius: 6 student records, cosmetic only, no operational impact

STATUS
NOT RUN. 23rd hourly check (Fri 31 Jul 2026). All 6 unchanged. Low priority.
# Issue 38 — Aug Bank Holiday Shunt (9th check Tue 4 Aug 2026 UTC)
Reporter: NM | Area: Holidays/Bookings | Sheet row: 40

## Symptom
School closed Mon Aug 3 (Aug Bank Holiday). 22 booking courses have start_date = 2026-08-03
and the Aug BH is still absent from school_closures. Students attending day 2.

## Root Cause (verified 2026-08-04 UTC, 9th check)
- school_closures: no August Bank Holiday entry covering 2026-08-03. Shunt not run.
- 22 booking courses active with start_date = 2026-08-03.
  One new this run: BC25038 Eduardo Roche Diaz (student 14602, booking 18258, General English PM, ends Fri 7 Aug).
- 7 students now have class assignments (assigned since prev run):
  BC1755 (Maria Giulia Serpi), BC24627 (Angelica Guerin), BC24908 (Ai Tsunashima),
  BC24956 (Giampaolo Russo), BC24984 (Deva Sofia Onorato), BC25002 (Aleix Cervera primary), BC25028 (Edgar Gilabert Mata).
- 15 BCs still have 0 class assignments (including BC25003 Cervera duplicate — deactivate, not assign).
- URGENT: BC88 (Africa Mera Bachir, bk82, student 76) and BC25038 (Eduardo Roche Diaz) both end Fri 7 Aug.
- BC25006 (Marina Larripa, ended 2026-08-03): still active, 2 days stale.

## Full BC list — 22 active (start_date 2026-08-03)
  BC 88    | ends Fri 7 Aug  | Africa Mera Bachir (bk82, student 76)             | 0 SCAs — URGENT
  BC 97    | ends Dec 18     | Gustavo Ferreira                                   | 0 SCAs
  BC 1755  | ends Aug 14     | Maria Giulia Serpi                                 | 1 SCA  — assigned
  BC 1766  | ends Sep 4      | Maria Eduarda Alves Paiva                          | 0 SCAs
  BC 24627 | ends Aug 14     | Angelica Guerin                                    | 1 SCA  — assigned
  BC 24908 | ends Aug 21     | Ai Tsunashima                                      | 1 SCA  — assigned
  BC 24956 | ends Sep 11     | Giampaolo Russo (Issue 41)                         | 1 SCA  — assigned
  BC 24958 | ends Feb 5 2027 | Aurora Madril Oliveira Molina                      | 0 SCAs
  BC 24959 | ends Feb 5 2027 | Diego Alves da Silva Molina                        | 0 SCAs
  BC 24964 | ends Aug 14     | Luana Salzano                                      | 0 SCAs
  BC 24984 | ends Aug 25     | Deva Sofia Onorato                                 | 2 SCAs — assigned
  BC 24999 | ends Aug 29     | Soumaya Bourguiba                                  | 0 SCAs
  BC 25002 | ends Sep 18     | Aleix Cervera Gonzalez (primary)                   | 1 SCA  — assigned
  BC 25003 | ends Sep 18     | Aleix Cervera Gonzalez (DUPLICATE — deactivate)    | 0 SCAs
  BC 25010 | ends Aug 28     | Alin Merticariu                                    | 0 SCAs
  BC 25016 | ends Jan 22     | Anderson da Silva Martins                          | 0 SCAs
  BC 25028 | ends Aug 28     | Edgar Gilabert Mata                                | 1 SCA  — assigned
  BC 25029 | ends Nov 13     | Monica Breier Fiametti                             | 0 SCAs
  BC 25030 | ends Aug 28     | Tayron Sanches Feijo Filho                         | 0 SCAs
  BC 25033 | ends Aug 28     | Jingyi Yang                                        | 0 SCAs
  BC 25035 | ends Dec 18     | Rakan Alghamdi                                     | 0 SCAs
  BC 25038 | ends Fri 7 Aug  | Eduardo Roche Diaz (bk18258, student 14602) NEW    | 0 SCAs — URGENT

## Fix Recipe (NOT YET RUN)

Step 1 — URGENT: Assign classes for BC88 + BC25038 today (both end Fri Aug 7):
  BC88 Africa Mera Bachir (booking 82, student 76): confirm class, create SCA.
  BC25038 Eduardo Roche Diaz (booking 18258, student 14602, General English PM): confirm PM class, create SCA.

Step 2 — Insert August Bank Holiday into school_closures:
  INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Public holiday Ireland 2026', false);

Step 3 — Deactivate BC25003 (Cervera duplicate) and BC25006 (Marina Larripa, 2d stale):
  UPDATE booking_courses SET active = false WHERE id IN (25003, 25006);

Step 4 — Shunt remaining active BCs (start_date Aug 3 to Aug 4):
  UPDATE booking_courses
  SET start_date = '2026-08-04'
  WHERE start_date = '2026-08-03'
    AND active = true
    AND id NOT IN (25003, 25006);
  Verify count = 20 rows.

Step 5 — Assign classes for remaining 12 students with 0 SCAs:
  BC97, BC1766, BC24958, BC24959, BC24964, BC24999, BC25010, BC25016, BC25029, BC25030, BC25033, BC25035.
  Confirm class with academic staff, then:
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (<bc_id>, <class_id>, '2026-08-04', '<end_date>');

Step 6 — Verify:
  SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true;
  Expect: 0.
  SELECT active FROM booking_courses WHERE id IN (25003, 25006);
  Expect: both false.

## Risk / Category
bookings, data-hygiene | Reversible: yes | Blast radius: 22 BCs, 21 students

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (9th check)
URGENCY: BC88 (Africa) + BC25038 (Eduardo) end Fri 7 Aug — assign today.
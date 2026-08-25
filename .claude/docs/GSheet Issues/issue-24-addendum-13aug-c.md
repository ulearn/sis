# Issue 24 — Alberto Squillace — Addendum 13 Aug 2026 (c)

Sheet row 25 | Check 76th | 249th global run ~18:xx UTC

No change since 75th check (17:03 UTC today).

- BC 24686 (Morning General, booking 1611): startDate=2026-07-20, endDate=2026-09-18, active=true, 0 class assignments
- ~24 calendar days since course start (~18–19 school days without a class)
- Course ends 18 Sep 2026 (36 days remaining — still actionable)

Fix (NOT YET RUN):
  Assign Alberto to Morning General class via SIS UI (BC 24686, week_end=2026-09-18)
  Or: INSERT INTO StudentClassAssignment (booking_course_id, class_id, week_end) VALUES (24686, <correct_class_id>, '2026-09-18');
  Confirm class_id via: SELECT id, name FROM Class WHERE name ILIKE '%morning%general%' ORDER BY id DESC LIMIT 10;

Status: Open. BC 24686 0 SCAs (~19 school days lost). Course ends Sep 18 (36d). Fix NOT RUN.
Last checked: 2026-08-13 ~18:xx UTC

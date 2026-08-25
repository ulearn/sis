# Issue 38 — Aug Bank Holiday 2026 (72nd check, 1st on Aug 3)
Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

Symptom: Aug BH 2026-08-03 absent from school_closures; 21 BCs start that date.

Root cause (Mon 3 Aug 2026 UTC, 1st check today — BH IS TODAY):
- school_closures: 9 entries only (Good Fridays + Christmas). Aug BH STILL ABSENT.
- 21 active booking courses still start 2026-08-03 — shunt NOT executed.
- BC 24697 (Rakan bk17915, AY Morning, Jul6-Jul31): ended 3 days ago, active=true — stale.
- BC 25003 (Aleix Cervera Gonzalez, bk18225): duplicate still active alongside BC 25002.
- BC 25035 (Rakan bk17915, General English AY AM Plus, Aug3-Dec18): starts today, needs shunt to Aug4.
- Only 1 BC currently starts Aug4 (BC 24953, bk18178 — already correct, not a shunt target).
- State unchanged from 2aug-r — recipe already written; has NOT been run.

Fix recipe (NOT YET RUN — same steps as issue-38-addendum-2aug-r.md):

Step 1a — Deactivate stale BC 24697 (Rakan AY Morning, ended Jul31):
  UPDATE booking_courses SET active = false WHERE id = 24697;

Step 1b — Deactivate duplicate BC 25003 (Aleix):
  UPDATE booking_courses SET active = false WHERE id = 25003;
  Verify: SELECT id, active FROM booking_courses WHERE booking_id = 18225;

Step 2 — Insert August Bank Holiday:
  INSERT INTO school_closures (created_at, name, start_date, end_date, note, is_paid_holiday)
  VALUES (NOW(), 'August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish Bank Holiday', false);
  Verify: SELECT * FROM school_closures WHERE start_date = '2026-08-03';

Step 3 — Shunt 19 remaining BCs from Aug3 to Aug4:
  UPDATE booking_courses SET start_date = '2026-08-04' WHERE start_date = '2026-08-03' AND active = true;
  Verify: SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true; -- must be 0

Step 4 — Create class assignments for week starting Tue 4 Aug (via SIS admin):
  Priority: Giampaolo (BC 24956), Aurora (BC 24958), Diego (BC 24959), Rakan (BC 25035).
  See also Issue 41 (Giampaolo SCA + Capel BA) and Issue 24 (Alberto manual SCA).

Risk/category: bookings + classes; medium blast radius (19 students). Reversible.
Status: NOT RUN — 72nd check, 1st on Mon 3 Aug 2026 UTC. BH IS TODAY — EXECUTE NOW.

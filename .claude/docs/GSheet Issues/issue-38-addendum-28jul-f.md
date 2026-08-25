# Issue 38 — Aug Bank Holiday Shunt (145th check, Tue 28 Jul 2026)
Reporter: Staff | Area: Holidays, Bookings | Row: 40 | DEADLINE: Fri 31 Jul 2026

## Symptom
19 booking courses start on Aug 3 Bank Holiday; closure absent from schoolClosure table.

## Root Cause (Tue 28 Jul 2026 UTC — 145th check, unchanged)
- schoolClosure table: 9 rows (Good Fridays 2026-2030, Christmas 2026-2029). Aug BH 2026-08-03 absent.
- 19 active booking courses still have startDate = 2026-08-03 — unchanged.
- Duplicate BCs 25002+25003: both General English AM, both active=true, 0 class assignments each, same booking 18225 (Aleix Cervera Gonzalez). Deactivate BC25003.
- BK18249 (Edgar Gilabert Mata) + BK18250 (Monica Breier Fiametti): still PENDING.

## Fix Recipe — NOT YET RUN

Step 1: Deactivate duplicate BC 25003 (0 SCAs, safe)
  UPDATE booking_course SET active = false WHERE id = 25003;

Step 2: Add August Bank Holiday via SIS admin > School Closures
  Name: August Bank Holiday | startDate: 2026-08-03 | endDate: 2026-08-03

Step 3: Shunt 18 remaining BCs from Aug 3 to Aug 4 (Tue)
  UPDATE booking_course
  SET start_date = DATE(2026-08-04), end_date = end_date + INTERVAL 1 DAY
  WHERE start_date = DATE(2026-08-03) AND active = true;
  -- 18 rows affected (BC25003 already deactivated)

Step 4: Resolve BKs 18249+18250 with staff — confirm or cancel.

## Risk
Category: bookings / data-hygiene | Reversible: yes
Blast radius: 18 booking courses, up to 18 students. BC25003 has 0 SCAs — deactivation safe.

## Status
Open. DEADLINE Fri 31 Jul 2026 (3 days from today Tue 28 Jul).
Last checked: Tue 28 Jul 2026 16:00 UTC (145th check)

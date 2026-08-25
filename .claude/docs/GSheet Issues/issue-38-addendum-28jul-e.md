# Issue 38 — Aug Bank Holiday Shunt (144th check, Tue 28 Jul 2026)
Reporter: Staff | Area: Holidays, Bookings | Row: 40 | DEADLINE: Fri 31 Jul 2026

## Symptom
19 booking courses start on Aug 3 Bank Holiday; closure absent from schoolClosure table.

## Root Cause (Tue 28 Jul 2026 UTC)
- schoolClosure table has 9 rows: Good Fridays 2026-2030, Christmas 2026-2029. Aug BH 2026-08-03 absent.
- 19 active bookingCourse rows have startDate = 2026-08-03 (unchanged since last check).
- Duplicate BCs 25002 + 25003: both are General English AM, both active=true, 0 class assignments each, same booking 18225 (Aleix Cervera Gonzalez). One must be deactivated before shunting.
- New pending BKs 18249 (Edgar Gilabert Mata, BC25028) + 18250 (Monica Breier Fiametti, BC25029) both still PENDING, both start Aug 3.

## Fix Recipe — NOT YET RUN

Step 1: Deactivate duplicate BC 25003 (0 SCAs, safe)
  UPDATE booking_course SET active = false WHERE id = 25003;

Step 2: Add August Bank Holiday via SIS admin > School Closures
  Name: August Bank Holiday | startDate: 2026-08-03 | endDate: 2026-08-03

Step 3: Shunt 18 remaining BCs from Aug 3 to Aug 4
  UPDATE booking_course
  SET start_date = (2026-08-04), end_date = end_date + 1 day
  WHERE start_date = (2026-08-03) AND active = true;
  (BC 25003 already deactivated, so 18 rows affected)

Step 4: Check BKs 18249+18250 with staff — confirm or cancel.

## Risk
Category: bookings / data-hygiene | Reversible: yes (update dates back)
Blast radius: 18 BCs, up to 18 students course schedules. BC25003 has 0 SCAs — deactivation safe.

## Status
Open. 144h stale. Deadline Fri 31 Jul 2026 (3 days).
Last checked: Tue 28 Jul 2026 UTC
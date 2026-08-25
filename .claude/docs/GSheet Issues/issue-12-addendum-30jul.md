## Issue 12 -- Stale Booking Accommodations (113th check 2026-07-30)
Reporter: KC | Area: Booking / Accomm | Sheet row: 13
Last checked: 2026-07-30 UTC (113th check) -- hash change: column B updated with student IDs

### Symptom
Three students whose accommodation stay started on a Monday and ended on a Wednesday -- nights possibly cut short.

### Root cause (live DB, 2026-07-30)
- BA 11162: student 91 Massimiliano Cameran, booking 97, bed 179 Host Family, ended 2026-05-23 -- 68 days stale, active=true, fee=EUR 1,140
- BA 11314: student 91 Massimiliano Cameran, booking 18002, bed 179 Host Family, ended 2026-06-06 -- 54 days stale, active=true, fee=EUR 480
- BA 11319: student 14532 Ernesto Pesoa Gil (not Massimiliano), booking 18034, bed null, ended 2026-05-31 -- 60 days stale, active=true, fee=EUR 400
- Rakan Alghamdi (student 14444): no stale booking accommodations -- confirmed clean this check
- Bernardo Hughes Pimentel (student 14524): no stale booking accommodations -- confirmed clean this check

### Fix recipe (NOT YET RUN)
-- Deactivate 3 stale booking accommodations
UPDATE booking_accommodations SET active = false, updated_at = NOW()
WHERE id IN (11162, 11314, 11319) AND end_date < CURRENT_DATE AND active = true;
-- Expect 3 rows affected

Verify: SELECT id, end_date, active FROM booking_accommodations WHERE id IN (11162, 11314, 11319);
-- Expect active=false on all three

### Risk
Category: data-hygiene. Reversible. Blast radius: 3 records. No financial impact.

### Status
NOT YET RUN. Last checked: 2026-07-30 UTC (113th check). All three stale (68d/54d/60d max 68d).
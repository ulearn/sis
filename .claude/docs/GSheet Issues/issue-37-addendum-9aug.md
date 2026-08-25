# Issue 37 — Bed 83 stale booking accommodations

Reporter: KC | Area: Accommodation | Sheet row 39 | 19th check Sun 9 Aug 2026 UTC

## Symptom
Multiple stale booking accommodations on bed 83 remain active after end dates.

## Root cause
5 stale BAs on bed 83 (all active = true, all past end date as of 9 Aug 2026):

| BA ID | Booking | End Date   | Days Stale | Fee        |
|-------|---------|------------|-----------|------------|
| 11239 | 22      | 2026-05-24 | 77d       | EUR 1,050  |
| 11168 | 92      | 2026-06-20 | 50d       | EUR 700    |
| 11285 | 17825   | 2026-07-05 | 35d       | null (!)   |
| 11352 | 18156   | 2026-07-11 | 29d       | EUR 360    |
| 11179 | 82      | 2026-08-09 | 0d TODAY  | EUR 1,360  |

Active/future — DO NOT deactivate:
- BA 11173 (booking 88): 2026-08-09 to 2026-08-30 — CURRENT (starts today)
- BA 25 (booking 17844): 2026-08-30 to 2026-10-11 — FUTURE

New since Sat 8 Aug: BA 11179 ended today — now 5th stale BA.
BA 11285 fee = null — set before or with deactivation.

## Fix recipe (NOT YET RUN)
```sql
-- Step 1: Set fee on BA 11285 (confirm amount with accounts first)
-- UPDATE "BookingAccommodation" SET fee = <amount> WHERE id = 11285;

-- Step 2: Deactivate 5 stale BAs
UPDATE "BookingAccommodation" SET active = false
WHERE id IN (11239, 11168, 11285, 11352, 11179);

-- Step 3: Verify — should return 0 rows
SELECT id, end_date, active FROM "BookingAccommodation"
WHERE id IN (11239, 11168, 11285, 11352, 11179) AND active = true;

-- Step 4: Confirm current + future still active
SELECT id, start_date, end_date, active FROM "BookingAccommodation"
WHERE id IN (11173, 25);
```

## Risk
Category: data-hygiene (cosmetic) | Reversible: yes | Blast radius: 5 BA rows; BA 11285 fee = null needs confirming

## Status
Pending — 5 stale BAs (max 77d). BA 11179 newly stale today. BA 11285 fee = null. Fix NOT RUN.
Last checked: Sun 9 Aug 2026 UTC
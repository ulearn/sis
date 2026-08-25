# Issue 16 — Mélie Villard / Bed 66 Stale Booking Accommodations

**Reporter:** AC | **Area:** Booking / Accomm | **Sheet row:** 17 | **Check:** 28th (Sun 16 Aug 2026 UTC)

## Symptom
System showed wrong accommodation dates for Mélie Villard (student 14498); date changes blocked.

## Root cause
All 4 Booking Accommodations for bed 66 remain active=true past their end dates. 4 different students.

| BA ID | Student | Booking | End Date | Days Stale |
|-------|---------|---------|----------|-----------|
| 11216 | Erii Takigawa | 46 | 2026-05-09 | 99 |
| 11158 | Hugo Tavernier | 100 | 2026-05-17 | 91 |
| 11282 | Mélie Villard | 17897 | 2026-06-05 | 72 |
| 11361 | Filippo Corazzini | 18190 | 2026-08-09 | 7 |

Note: BAs 11158 (May 10-17) and 11282 (May 15–Jun 5) overlap 2 days — validate before deactivating.

## Fix recipe (NOT YET RUN)

Step 1 — Verify:
SELECT ba.id,ba.end_date,ba.active,b.status,s.first_name,s.last_name FROM booking_accommodations ba JOIN bookings b ON ba.booking_id=b.id JOIN students s ON b.student_id=s.id WHERE ba.id IN (11216,11158,11282,11361);

Step 2 — Deactivate:
UPDATE booking_accommodations SET active=false WHERE id IN (11216,11158,11282,11361) AND end_date < NOW();

## Risk
data-hygiene / accommodations — reversible — bed 66 only

## Status
Open — Fix NOT RUN.

**Last checked:** Sun 16 Aug 2026 UTC (28th check)
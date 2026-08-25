# Issue 24 — Alberto Squillace (addendum Thu 6 Aug 2026 15:02 UTC)

Reporter: PG | Area: Booking/Class | Sheet row 25 | Check 61

## Symptom
Migration problem: student has two courses in SIS but holidays were in Fidelo; course split is wrong.

## Current state (confirmed 15:02 UTC)
- Student 1052 (Alberto Squillace): visa_status = null
- Booking 1611: CONFIRMED, confirmed=true, fully paid EUR 1,280.12, service_end = 2026-09-18
- Booking Course 24686 (Morning General, Jul 20 -- Sep 18 2026): active=true, 0 class assignments -- 17 days without assignment since Jul 20
- Booking Course 1797 (Morning General, ended Jun 26 2026): active=true -- 41 days stale

## Fix recipe (NOT YET RUN)

1. Assign BC 24686 to a class via SIS admin (Booking 1611 -> Class Assignments)
2. Deactivate stale BC 1797:

```sql
UPDATE booking_course SET active=false, updated_at=NOW() WHERE id=1797;
```

3. Optionally set student visa_status if known.

## Risk / category
- Category: bookings / class assignments | Reversible: yes | Blast radius: booking 1611, student 1052

## Status
OPEN -- fix NOT applied | Last checked: 2026-08-06 15:02 UTC
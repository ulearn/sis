# Issue 15 — Saikhantes Shagdarsuren (addendum Thu 6 Aug 2026 15:02 UTC)

Reporter: PG | Area: Booking/Class | Sheet row 16 | Check 47

## Symptom
Course dates/holidays make no sense; two memberships covering two courses.

## Root cause (confirmed 15:02 UTC)
- Booking 18151 (student 1001, Saikhantes Shagdarsuren): CONFIRMED, confirmed=true, fully paid EUR 1,339.20
- service_end = 2026-08-07T00:00:00Z -- EXPIRES IN ~9 HOURS (midnight UTC tonight)
- Booking Course 24925 (Academic Year Afternoon, ILEP 0318/0003): startDate 2026-03-09, endDate 2026-10-02 -- correct
- Booking service_end was never updated to match BC 24925 endDate of Oct 2

## Fix recipe (NOT YET RUN -- must run TONIGHT before midnight UTC)

```sql
-- Verify current state
SELECT id, status, confirmed, service_end, amount_paid, amount_open FROM booking WHERE id = 18151;

-- Update service_end to match BC 24925
UPDATE booking SET service_end = '2026-10-02T00:00:00Z', updated_at = NOW() WHERE id = 18151;

-- Verify
SELECT id, service_end FROM booking WHERE id = 18151;
-- Expected: 2026-10-02T00:00:00Z
```

Or: SIS admin -> Booking 18151 -> edit -> service end = 2 Oct 2026 -> save.

## Risk / category
- Category: bookings / data-hygiene | Reversible: yes | Blast radius: booking 18151 only
- URGENT: student portal access may break after midnight if service_end expires unextended

## Status
OPEN -- fix NOT applied | Last checked: 2026-08-06 15:02 UTC
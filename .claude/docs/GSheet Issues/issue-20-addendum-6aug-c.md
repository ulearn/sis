# Issue 20 — Ariunsarnai Batbayar (addendum Thu 6 Aug 2026 15:02 UTC)

Reporter: PG | Area: Booking/Class | Sheet row 21 | Check 32 | Day 116

## Symptom
Not appearing in to-be-assigned list; says payment due.

## Current state (confirmed 15:02 UTC)
- Booking 1605 (student 1047, Ariunsarnai Batbayar): status = PENDING, confirmed = false
- Amount paid = EUR 0, amount open = EUR 1,509 -- 0 payment records
- Booking Course 1791 (Academic Year Renewal Morning, Apr 13 -- Oct 23 2026): active = true
- 116 days since course start (Apr 13 2026) -- no payment received

## Fix recipe (NOT YET RUN)

1. Check HubSpot deal 1605 for payment history / notes
2a. If payment received: record payment via SIS, then set booking confirmed=true
2b. If student cancelled / not enrolled: cancel booking 1605; deactivate BC 1791

```sql
-- If confirming:
UPDATE booking SET status='CONFIRMED', confirmed=true, updated_at=NOW() WHERE id=1605;

-- If cancelling:
UPDATE booking SET status='CANCELLED', updated_at=NOW() WHERE id=1605;
UPDATE booking_course SET active=false, updated_at=NOW() WHERE id=1791;
```

## Risk / category
- Category: bookings / payments | Reversible: yes | Blast radius: booking 1605 only

## Status
OPEN -- fix NOT applied | Last checked: 2026-08-06 15:02 UTC
# Issue 26 — Ivan Rodriguez (addendum Thu 6 Aug 2026 15:02 UTC)

Reporter: PG | Area: Booking/Class | Sheet row 27 | Check 54

## Symptom
Intensive students only appear once in to-be-assigned list.

## Current state (confirmed 15:02 UTC)
- Booking Course 23 (Intensive General 30, ended May 22 2026): active=true -- 76 days stale
- Booking Course 24826 (2 weeks Intensive General 30, ended Jun 19 2026, booking 18034): active=true -- 48 days stale
- Booking 18034 (Ivan Rodriguez, student 145): PARTIAL, confirmed=false, amount paid=EUR 845, amount open=EUR 250
- Payment 17683: EUR 845, Bank, Apr 23 2026, xeroPaymentId=null -- 105 days unreconciled

## Fix recipe (NOT YET RUN)

1. Deactivate stale booking courses:
```sql
UPDATE booking_course SET active=false, updated_at=NOW() WHERE id IN (23, 24826);
```

2. Chase EUR 250 remaining on booking 18034 (check HubSpot deal 22 for payment notes)
3. Once EUR 250 received: record payment, set booking 18034 confirmed=true
4. Reconcile payment 17683 (EUR 845, Bank, Apr 23) in Xero -- xeroPaymentId is null

## Risk / category
- Category: bookings / payments / Xero | Reversible: yes | Blast radius: bookings 22 + 18034, student 145

## Status
OPEN -- fix NOT applied | Last checked: 2026-08-06 15:02 UTC
# Issue 30 — Giulia Avallone / Milena Verdi (BC104 stale + Xero unreconciled)

Reporter: KC | Area: Booking/Accounts | Sheet row 31 | 122nd check Sun 9 Aug 2026 UTC

## Symptom
BC 104 active 44 days after ending. Two payments unreconciled in Xero (96d + 122d).

## Root cause
### BC 104 stale
- BC 104 (Morning General Plus, bookingId = 94): endDate 2026-06-26, active = true — 44 days stale
- Booking 94 (Giulia Avallone, student 88): CONFIRMED, amountPaid EUR 1,151.50, amountOpen EUR 0

### Xero unreconciled payments
- Payment 17102: EUR 1,151.50, Bank Transfer, createdAt 2026-05-05, xeroPaymentId = null — 96 days (booking 94, Giulia Avallone)
- Payment 945: EUR 4,231.00, Bank Transfer, createdAt 2026-04-09, xeroPaymentId = null — 122 days (booking 79, Milena Verdi)

No change since Sat 8 Aug.

## Fix recipe (NOT YET RUN)
### 1. Deactivate BC 104
```sql
UPDATE "BookingCourse" SET active = false WHERE id = 104;
```
### 2. Reconcile payment 17102 in Xero (EUR 1,151.50, Giulia Avallone, ~May 5 2026)
Find Xero bank transaction → match to invoice for booking 94 → get xero_id → update:
```sql
UPDATE "Payment" SET xero_payment_id = '<xero_id>' WHERE id = 17102;
```
### 3. Reconcile payment 945 in Xero (EUR 4,231, Milena Verdi, ~Apr 9 2026)
Find Xero bank transaction → match to invoice for booking 79 → get xero_id → update:
```sql
UPDATE "Payment" SET xero_payment_id = '<xero_id>' WHERE id = 945;
```

## Risk
Category: data-hygiene (BC); money (Xero) | Reversible: yes | Blast radius: BC 104 + payments 17102 + 945

## Status
Pending — BC 44d stale; payment 17102 unreconciled 96d; payment 945 unreconciled 122d. Fix NOT RUN.
Last checked: Sun 9 Aug 2026 UTC
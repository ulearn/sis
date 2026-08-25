# Issue 15 — Saikhantes Shagdarsuren: service_end EXPIRES TOMORROW (6 Aug 2026)

**Reporter:** AC | **Area:** Booking / Class | **Sheet row:** 16 | **Check:** 37th (Thu 6 Aug 2026 UTC)
**DEADLINE: Fri 7 Aug 2026 — service_end expires in 1 day**

## Symptom
Booking 18151 service_end = 2026-08-07 (tomorrow). Course runs to 2 Oct 2026 after 5-week holiday push. service_end was never updated.

## Root cause (live data)

**Booking 18151 (Saikhantes Shagdarsuren, student 1001):**
- Status: CONFIRMED, confirmed = true
- service_end = 2026-08-07 (TOMORROW)
- amount_paid = EUR 1,339.20, amount_open = EUR 0 (fully paid)

**Booking Course 24925 (Academic Year Afternoon):**
- start_date = 9 Mar 2026, end_date = 2 Oct 2026
- active = true, 1 student class assignment
- Student on holiday 20 Jul to 21 Aug, returns Mon 24 Aug

**Gap:** service_end expires tomorrow; enrolled course runs to 2 Oct 2026. 56-day discrepancy.
From Sat 8 Aug the booking appears expired in SIS; student returns 24 Aug to a booking that looks closed.

**Payment 17872:** xero_payment_id = null (unreconciled with Xero — secondary).

## Fix recipe (NOT YET RUN — MUST RUN BEFORE FRI 7 AUG)

### Step 1 — Extend service_end to match course end
```sql
-- RUN TODAY (Thu 6 Aug) or first thing Fri 7 Aug before system opens
UPDATE public.bookings
SET service_end = '2026-10-02'
WHERE id = 18151
  AND service_end = '2026-08-07';
```

### Step 2 — Verify
```sql
SELECT id, status, confirmed, service_end::date, amount_paid FROM public.bookings WHERE id = 18151;
-- Expected: service_end = 2026-10-02
```

### Step 3 — Payment 17872 Xero reconciliation (secondary — not urgent today)
Find Xero payment for EUR 1,339.20 and update:
```sql
UPDATE public.payments SET xero_payment_id = '<XERO_ID>' WHERE id = 17872;
```

## Risk / category
- **Bookings**: low risk, reversible single-row update.
- If NOT run by Fri: booking appears expired Sat 8 Aug; student returns 24 Aug to a closed booking.
- Blast radius: 1 student.

## Status
OPEN — fix NOT RUN. **Deadline: Fri 7 Aug 2026 (tomorrow).**
**Last checked:** Thu 6 Aug 2026 UTC
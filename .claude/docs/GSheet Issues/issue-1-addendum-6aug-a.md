# Issue 1 — Orphan Payments + Stale Booking Courses (6 Aug 2026)

**Reporter:** NM | **Area:** Cleanup | **Sheet row:** 2 | **Check:** 157th (Thu 6 Aug 2026 UTC)

## Symptom
4 payments with no linked booking; 3 booking courses active past end date.

## Root cause (live data — verified Thu 6 Aug UTC)

### Orphan payments (all unchanged, booking_id = null, xero_payment_id = null)
| ID | Amount | Method | Date | Age |
|----|--------|--------|------|-----|
| 16988 | EUR 339.90 | Bank | 28 Apr 2026 | 100 days |
| 16989 | EUR 339.90 | Bank | 28 Apr 2026 | 100 days |
| 17187 | EUR 6,151 | TransferMate Escrow | 1 May 2026 | 97 days |
| 4781 | EUR 380 | Flywire | 20 Aug 2019 | legacy |

Payments 16988/16989 likely belong to bookings 17856/17857:
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed = false, amount_paid = EUR 339.90, amount_open = null
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed = false, amount_paid = EUR 339.90, amount_open = null

Payment 17187 (EUR 6,151 TransferMate): booking unknown — requires HubSpot/TransferMate cross-reference (txn D2026226).
Payment 4781 (EUR 380 Flywire 2019): legacy orphan.

### Stale booking courses
| BC ID | Name | End Date | Active | SCAs | Staleness |
|-------|------|----------|--------|------|-----------|
| 25006 | General English AM Plus | 3 Aug 2026 | true | 2 | 3 days |
| 24630 | General English AM Plus | 10 Jul 2026 | true | 0 | 27 days |
| 24631 | General English AM Plus | 10 Jul 2026 | true | 0 | 27 days |

## Fix recipe (NOT YET RUN)

### Step 1 — Link payments 16988/16989 to bookings 17856/17857
```sql
UPDATE public.payments SET booking_id = 17856 WHERE id = 16988;
UPDATE public.payments SET booking_id = 17857 WHERE id = 16989;
```

### Step 2 — Fix confirmed = false on bookings 17856/17857
```sql
UPDATE public.bookings SET confirmed = true WHERE id IN (17856, 17857) AND status = 'CONFIRMED';
```

### Step 3 — Deactivate stale booking courses
```sql
UPDATE public.booking_courses SET active = false WHERE id IN (25006, 24630, 24631);
```

### Step 4 — Payment 17187 (EUR 6,151 TransferMate Escrow)
Manually check HubSpot and TransferMate for which booking this matches. Txn: D2026226.

### Step 5 — Payment 4781 (EUR 380 Flywire 2019)
Legacy orphan. Confirm with accounts whether to write off or link.

## Risk / category
- **Payments**: medium — verify bk17856/17857 are correct match before linking. Reversible.
- **Booking courses**: low — reversible (set active = true to undo).
- Blast radius: 2 students, 3 booking courses.

## Status
Open — fix NOT RUN. 100 days since orphan payments appeared.
**Last checked:** Thu 6 Aug 2026 UTC
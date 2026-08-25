# Issue 1 - Orphan Payments - Addendum 15 Aug 2026

Reporter: NM | Area: Cleanup | Sheet row: 2

## Current State (259th check - Sat 15 Aug 2026 UTC)
No change from 258th check (Fri 14 Aug).

### Orphan Payments
- Payment 4781: EUR 380, Flywire, 2019-08-20 - booking_id = null (legacy Fidelo orphan)
- Payment 16988: EUR 339.90, Bank, 2026-04-28 - booking_id = null (likely Booking 17856, Margherita Galbusera)
- Payment 16989: EUR 339.90, Bank, 2026-04-28 - booking_id = null (likely Booking 17857, Francesca Fassina)
- Payment 17187: EUR 6,151, TransferMate, 2026-05-01 - booking_id = null, ref ULEARNP2026124 (no matching booking found)

### Unconfirmed Bookings
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed = false, amountPaid = EUR 339.90
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed = false, amountPaid = EUR 339.90

### Stale Booking Courses
- BC 24630: General English AM Plus, Jun 29 - Jul 10 2026, active = true (36 days stale)
- BC 24631: General English AM Plus, Jun 29 - Jul 10 2026, active = true (36 days stale)

## Fix Recipe (NOT YET RUN)

### 1. Link orphan payments to bookings (SQL - run in psql or Prisma)
    UPDATE payment SET booking_id = 17856 WHERE id = 16988;
    UPDATE payment SET booking_id = 17857 WHERE id = 16989;

### 2. Set confirmed = true
    UPDATE booking SET confirmed = true WHERE id IN (17856, 17857);

### 3. Deactivate stale BCs
    UPDATE booking_course SET active = false WHERE id IN (24630, 24631);

### 4. Payment 17187 (EUR 6,151) - manual lookup
- Check TransferMate portal for ref ULEARNP2026124
- Check HubSpot for matching deal circa May 2026

### 5. Payment 4781 (Flywire 2019) - legacy orphan
- Fidelo ref 21022; low priority; may be left as-is

## Risk / Category
Category: Accounts / Data hygiene | Reversible: Yes
Blast radius: 2 students (Galbusera, Fassina)
Time risk: Low (historical; BCs already ended)

## Status
OPEN - fix NOT RUN; Payment 17187 EUR 6,151 needs manual TM/Hub lookup
Last checked: 2026-08-15 UTC (259th check)
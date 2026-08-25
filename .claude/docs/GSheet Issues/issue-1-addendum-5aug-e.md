# Issue 1 — Orphan Payments + Stale Booking Courses (155th Check)
Reporter: NM | Area: Cleanup | Sheet row: 2 | 155th check Wed 5 Aug 2026 UTC
No change from 154th check.

## State (verified live DB)
Orphan payments — 4 payments, booking_id=null, xero_payment_id=null:
- Payment 4781: EUR 380.00, 2019-08-20, Flywire, txn D20191404 (legacy 2019)
- Payment 16988: EUR 339.90, 2026-04-28, Bank, no txn — 98 days
- Payment 16989: EUR 339.90, 2026-04-28, Bank, no txn — 98 days
- Payment 17187: EUR 6,151.00, 2026-05-01, TransferMate Escrow, txn D2026226 — 95 days
Bookings 17856 (Margherita Galbusera) + 17857 (Francesca Fassina): CONFIRMED, confirmed=false, EUR 339.90 paid, open=null
Stale BCs: 25006 (ended 3 Aug, 2d stale, 2 SCAs), 24630 (ended 10 Jul, 26d stale, 0 SCAs), 24631 (ended 10 Jul, 26d stale, 0 SCAs)

## Fix Recipe (NOT YET RUN)
Step 1: UPDATE payments SET booking_id=17857 WHERE id=16988; (Confirm HubSpot invoices first)
Step 2: UPDATE payments SET booking_id=17856 WHERE id=16989;
Step 3: UPDATE bookings SET confirmed=true, updated_at=NOW() WHERE id IN (17856,17857);
Step 4: UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id IN (25006,24630,24631);
Step 5: Payment 17187 (EUR 6,151 D2026226) — find booking and link.
Step 6: Payment 4781 (EUR 380, 2019) — confirm with Neil, likely write-off.

## Risk
Category: Money/bookings/data-hygiene | Reversible: Yes | Blast radius: 4 payments, 3 BCs, 2 bookings
Status: OPEN — NOT YET RUN | Last checked: Wed 5 Aug 2026 UTC (155th check)
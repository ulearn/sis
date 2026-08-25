# Issue 37 Addendum 8 Aug 2026

**Check:** 18th (Sat 8 Aug 2026 UTC)  Sheet row: 39

## Status -- unchanged from 17th check (Fri 7 Aug)

- Booking Accommodation 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825): ended 5 Jul 2026, active = true -- 34 days stale, fee = null
- Booking Accommodation 11352 (Veronica Martin, bed 83, booking 18156): ended 11 Jul 2026, active = true -- 28 days stale, fee = EUR 360
- Bed 83 currently occupied by Africa Mera Bachir (ends 9 Aug) then Alessandro Signorotti (9 Aug to 30 Aug)
- Additional stale BAs on bed 83: BA 11168 (Diego Da Silva Saldanha, ended 20 Jun, 49d stale), BA 11239 (Ivan Rodriguez Solares, ended 24 May, 76d stale)
- All stale BAs are cosmetic only -- no conflict with current bookings

## Fix (NOT YET RUN)

1. Deactivate: UPDATE booking_accommodation SET active = false WHERE id IN (11285, 11352, 11168, 11239);
2. Set fee on BA 11285: UPDATE booking_accommodation SET fee = <check fee with Diego> WHERE id = 11285;

## Risk: data-hygiene. Reversible. Cosmetic -- no live booking impact.

## Status: Open. NOT YET RUN. BAs 34d and 28d stale.

## Last Checked: Sat 8 Aug 2026 UTC (18th check)
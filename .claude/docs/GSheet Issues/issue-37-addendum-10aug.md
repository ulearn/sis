Issue 37 - Bed 83 Stale Booking Accommodations (20th check Mon 10 Aug 2026)
- BA 11239 (booking 22): ended 2026-05-24 - 78d stale
- BA 11168 (booking 92): ended 2026-06-20 - 51d stale
- BA 11285 (booking 17825): ended 2026-07-05 - 36d stale, fee=null
- BA 11352 (booking 18156): ended 2026-07-11 - 30d stale
- BA 11179 (booking 82): ended 2026-08-09 - 1d stale (ended yesterday)
Current: BA 11173 (Aug 9-30). Future: BA 25 (Aug 30-Oct 11). Do NOT deactivate.
Fix: UPDATE BookingAccommodation SET active=false WHERE id IN (11239,11168,11285,11352,11179); (NOT YET RUN)
Set fee on BA 11285 (get amount from Neil/KC first). Last checked: 2026-08-10 UTC

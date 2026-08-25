Issue 16 - Bed 66 Stale Booking Accommodations (20th check Mon 10 Aug 2026)
- BA 11216 (booking 46): ended 2026-05-09 - 93d stale
- BA 11158 (booking 100): ended 2026-05-17 - 85d stale
- BA 11282 (booking 17897): ended 2026-06-05 - 66d stale
- BA 11361 (booking 18190): ended 2026-08-09 - 1d stale (ended yesterday)
Bed 66 free from 10 Aug.
Fix: UPDATE BookingAccommodation SET active=false WHERE id IN (11361,11282,11158,11216); (NOT YET RUN)
Last checked: 2026-08-10 UTC

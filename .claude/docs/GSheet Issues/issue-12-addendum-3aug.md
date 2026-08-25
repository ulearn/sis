Issue 12 - Stale Booking Accommodations (120th check Mon 3 Aug 2026 UTC, 2nd today)
Reporter: KC | Area: Booking / Accomm | Sheet row: 13


ROOT CAUSE (fresh 3 Aug 2026 UTC, all 3 unchanged):
- BA 11162 (booking 97, Massimiliano Cameran, bed 179, Apr 21-May 23 2026): active=true, fee EUR 1,140 - 72 days stale
- BA 11314 (booking 18002, Massimiliano Cameran, bed 179, May 23-Jun 6 2026): active=true, fee EUR 480 - 58 days stale
- BA 11319 (booking 18034, no bed assigned, May 31-May 31 2026, zero-duration): active=true, fee EUR 400 - 64 days stale
Bed 179 remains blocked for new allocation by BAs 11162 and 11314.


FIX RECIPE (NOT YET RUN):
  UPDATE booking_accommodations SET active = false WHERE id IN (11162, 11314, 11319);
  Note: confirm BA 11319 fee EUR 400 with accounts (no bed was assigned).


RISK: bookings/accommodation | Reversible: yes | Blast: bed 179 freed; 3 BA records
STATUS: 120th check Mon 3 Aug 2026 UTC (2nd today). All 3 unchanged. NOT YET RUN.
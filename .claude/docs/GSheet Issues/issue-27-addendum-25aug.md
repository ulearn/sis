Issue 27 Addendum 25 Aug 2026

59th check Tue 25 Aug 2026 UTC
Booking 17909 (Sofiia Korkishchenko): status = CANCELLED, confirmed = true (anomaly — should be false)
Amount paid = EUR 0, amount total = EUR 727.50, amount open = EUR 727.50, 0 payments linked
Last DB update: 2026-06-17 (69 days unchanged). Duplicate of Issue 7.
No change from 58th check (Mon 24 Aug).

Fix (NOT YET RUN):
UPDATE bookings SET confirmed = false WHERE id = 17909;
Coordinate with Issue 7 fix (same booking, same change).

Risk: bookings / data-hygiene | reversible | booking 17909 only
Status: Open. 69 days open. Duplicate of Issue 7.
Last checked: 2026-08-25 UTC (520th run, 59th issue check)
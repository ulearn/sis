# Issue 12 — Stale Booking Accommodations (121st Tue 4 Aug UTC)

Reporter: KC | Row: 13

Root cause (fresh Tue 4 Aug 2026 UTC — UNCHANGED)
- Booking accommodation 11162 (bk97, Massimiliano Cameran, bed 179, Apr 21-May 23 2026): active=true — 73 days stale.
- Booking accommodation 11314 (bk18002, Massimiliano Cameran, bed 179, May 23-Jun 6 2026): active=true — 59 days stale.
- Booking accommodation 11319 (bk18034, no bed, May 31-May 31 2026, zero duration): active=true — 65 days stale.
- Bed 179 blocked for new allocation by booking accommodations 11162 and 11314.

Fix recipe (NOT YET RUN)
  UPDATE booking_accommodations SET active = false WHERE id IN (11162, 11314, 11319);
  Note: confirm booking accommodation 11319 fee EUR 400 with accounts (no bed assigned).
  SELECT id, active, end_date FROM booking_accommodations WHERE id IN (11162, 11314, 11319);

Risk: bookings/accommodation | Reversible: yes | Blast: 3 records, bed 179 freed
Status: OPEN — 73 days max stale. Bed 179 double-blocked. Fix NOT RUN.
Last checked: Tue 4 Aug 2026 UTC (121st check)

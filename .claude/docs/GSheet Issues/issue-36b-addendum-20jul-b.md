# Issue 36b addendum B — Mon 20 Jul 2026 (35th check, 16th hourly)

Area: Booking / Accommodation — stale active BAs | Sheet row 38

## Partial fix applied since 13th hourly run today

5 of 6 previously tracked BAs are now inactive (deactivated between 13th and 16th hourly):
- BA11156 (Hugo Tavernier): deactivated
- BA11175 (Juan Carlos Guerra Nunez): deactivated
- BA11264 (Leandre Le Coz-Bruhmuller): deactivated
- BA11270 (Neil Mc Mahon): deactivated
- BA11271 (Salvatore Cumia): deactivated

## Remaining stale BAs (active = true, end date < 20 Jul 2026)

Booking accommodations with bed assignments (blocking bed availability):
- BA11265: bed 157, booking 1274 — ended 19 Jul 2026 — 1 day stale — BLOCKS bed 157
- BA11257: bed 168, booking 7 — ended 18 Jul 2026 — 2 days stale — NEW this run
- BA11365: bed 174, booking 18184 — ended 18 Jul 2026 — 2 days stale — NEW this run
- BA11345: bed 89, booking 17826 — ended 12 Jul 2026 — 8 days stale
- BA11339: bed 59, booking 17912 — ended 4 Jul 2026 — 16 days stale
- BA11247: bed 161, booking 17 — ended 4 Jul 2026 — 16 days stale
- BA11167: bed 168, booking 93 — ended 4 Jul 2026 — 16 days stale

Without bed (no capacity impact, still data noise):
- BA11174: no bed, booking 87 — ended 19 Jul 2026
- BA11276: no bed, booking 17876 — ended 11 Jul 2026

Note: BA11352 (bed 83) and BA11285 (bed 83) are tracked in Issues 37 and 43 respectively.

## Fix recipe (NOT YET RUN)

Run in SIS Postgres (READ-ONLY diagnosis; Neil to execute):
  UPDATE booking_accommodations
  SET active = false
  WHERE id IN (11265, 11257, 11365, 11345, 11339, 11247, 11167)
  AND active = true;

  -- Verify before running:
  SELECT id, bed_id, booking_id, end_date FROM booking_accommodations
  WHERE id IN (11265, 11257, 11365, 11345, 11339, 11247, 11167);

## Risk / category
Data-hygiene / bookings. Fully reversible (SET active = true to undo). No financial impact.
Beds 157, 168, 174, 89, 59, 161 may appear unavailable in allocation view until fixed.

## Status
OPEN. 5 BAs fixed. 7 remain. Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (35th check, 16th hourly).
# Issue 36b addendum — Tue 21 Jul 2026 (37th check, 22nd hourly)

Area: Booking / Accommodation — stale active BAs | Sheet row 38

## Status since last recipe

Previously tracked 11 stale BAs (all still active):
- BA9917 (bed 84, Kanna Hasegawa / booking 1274): ended 16 May 2026 — 66 days stale
- BA11246 (bed 161, Felix Lopez Rivera / booking 17): ended 6 Jun 2026 — 45 days stale
- BA30 (bed 33, Fabrizio Mauro / booking 17826): ended 14 Jun 2026 — 37 days stale
- BA11280 (bed 188, Valeriya Salauyova / booking 17912): ended 27 Jun 2026 — 24 days stale
- BA11167 (bed 168, booking 93), BA11247 (bed 161), BA11339 (bed 59): ended ~5 Jul — 16+ days stale
- BA11345 (bed 89, booking 17826): ended ~13 Jul — 8+ days stale
- BA11257 (bed 168), BA11365 (bed 174): ended ~19 Jul — 2+ days stale
- BA11265 (bed 157, booking 1274): ended ~20 Jul — 1+ day stale

## Newly surfaced stale BAs (21 Jul 2026)

3 new BAs with bed assignments — beds potentially blocked:
- BA11165: bed 189, Giulia Avallone (student 88, booking 94), 13 Jun–27 Jun 2026 — 24 days stale
- BA11278: bed 190, Leila Agbodjan (student 14493, booking 17892), 30 May–27 Jun 2026 — 24 days stale
- BA11354: bed 186, Giulia Avallone (student 88, booking 94), 27 Jun–28 Jun 2026 — 23 days stale

Note: Giulia Avallone (booking 94) has two new stale BAs on beds 189 and 186.
Booking 94 is also referenced in Issue 30 (BC104 stale + Xero payment 17102 unreconciled).

Also tracked in Issues 37/43: BA11285 (bed 83, Jesus Manuel, 16d stale), BA11352 (bed 83, Veronica, 10d stale)
No-bed noise: BA11276 (10d), BA11174 (2d)

## Fix recipe (NOT YET RUN)

Deactivate 14 stale BAs with bed assignments:

  -- Verify (read-only):
  SELECT id, bed_id, booking_id, start_date, end_date
  FROM booking_accommodations
  WHERE id IN (9917,11246,30,11280,11167,11247,11339,11345,11257,11365,11265,11165,11278,11354)
  ORDER BY end_date;

  -- Execute (Neil only, NOT YET RUN):
  UPDATE booking_accommodations SET active = false
  WHERE id IN (9917,11246,30,11280,11167,11247,11339,11345,11257,11365,11265,11165,11278,11354)
  AND active = true;
  -- 14 rows expected

System-wide fix (11,175 stale BAs total) requires a nightly automated job:
  UPDATE booking_accommodations SET active = false
  WHERE active = true AND end_date < CURRENT_DATE;

## Risk / category
Data-hygiene / bookings. Fully reversible. No financial impact.
Beds 84, 161, 33, 188, 168, 59, 89, 174, 157, 189, 190, 186 blocked until fixed.

## Status
OPEN. 14 tracked stale BAs with beds. Fix NOT YET RUN.
System-wide: 11,175 total stale BAs. Nightly job still needed.
Last checked: Tue 21 Jul 2026 UTC (37th check, 22nd hourly).
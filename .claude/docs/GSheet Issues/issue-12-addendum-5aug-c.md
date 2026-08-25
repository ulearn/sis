# Issue 12 — Stale Booking Accommodations (124th check Wed 5 Aug 2026 UTC)
Reporter: various | Area: Booking / Accomm | Sheet row: 13

Symptom: 3 booking accommodations still active past end dates, blocking bed 179.

Root Cause (verified 2026-08-05 UTC, 124th check)

Unchanged — all 3 stale BAs confirmed:
- BA 11162 (booking 97, Massimiliano Cameran, student 91, bed 179): ends 2026-05-23 — 74 days stale
- BA 11314 (booking 18002, Massimiliano Cameran, student 91, bed 179): ends 2026-06-06 — 60 days stale
- BA 11319 (booking 18034, Ernesto Pesoa Gil, student 14532, no bed): startDate = endDate = 2026-05-31 (zero-length), booking status = PARTIAL — 66 days stale

BA 11319 is zero-length (start = end = May 31) and its booking 18034 is PARTIAL. Anomalous record.
Bed 179 double-blocked by BAs 11162 and 11314 (both Massimiliano Cameran).
NOTE: Student 14524 (Bernardo Hughes Pimentel) in sheet col B is unrelated; actual stale student for BA 11319 is 14532 (Ernesto Pesoa Gil).

Fix Recipe (NOT YET RUN):
  UPDATE booking_accommodation SET active = false, updated_at = NOW() WHERE id IN (11162, 11314, 11319);

Risk: accommodations | Reversible: yes (set active = true) | Blast radius: 1 bed freed
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (124th check)
See also: issue-12-addendum-5aug-b.md

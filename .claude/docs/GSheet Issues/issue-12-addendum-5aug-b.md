# Issue 12 — Stale Booking Accommodations (123rd check Wed 5 Aug 2026 UTC)
Reporter: various | Area: Booking / Accomm | Sheet row: 13

Symptom: 3 booking accommodations active past end dates, blocking bed 179.

Root Cause (verified 2026-08-05 UTC, 123rd check):
Unchanged:
- BA 11162 (booking 97, Massimiliano Cameran, bed 179, ends 2026-05-23): active — 74 days stale
- BA 11314 (booking 18002, Massimiliano Cameran, bed 179, ends 2026-06-06): active — 60 days stale
- BA 11319 (booking 18034, Ernesto Pesoa Gil student 14532, no bed, ends 2026-05-31): active — 66 days stale

CORRECTION: Previous H incorrectly named BA 11319 student as Bernardo Hughes Pimentel.
Actual student for booking 18034 is Ernesto Pesoa Gil (student ID 14532).

Bed 179 blocked by BAs 11162 + 11314 (both Massimiliano, both stale).

Fix Recipe (NOT YET RUN):
  UPDATE booking_accommodation SET active = false WHERE id IN (11162, 11314, 11319);

Risk: accommodations | Reversible: yes | Blast radius: 1 bed freed
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (123rd check)
See also: issue-12-addendum-5aug.md
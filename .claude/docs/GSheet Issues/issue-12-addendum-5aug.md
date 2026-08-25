# Issue 12 — 122nd check Wed 5 Aug 2026

Reporter: various | Area: Booking / Accomm | Sheet row: 13

## State — verified 122nd check Wed 5 Aug 2026 UTC

Unchanged from 4 Aug — all 3 booking accommodations still active:
- BA 11162 (booking 97, Massimiliano Cameran, bed 179, ends 2026-05-23): active=true — 74 days stale
- BA 11314 (booking 18002, Massimiliano Cameran, bed 179, ends 2026-06-06): active=true — 60 days stale
- BA 11319 (booking 18034, no bed assigned, ends 2026-05-31, zero-duration): active=true — 66 days stale

Bed 179 still blocked by BA 11162 + BA 11314. Cannot be assigned to new students.

## Fix Recipe (NOT YET RUN)

Deactivate all 3 stale booking accommodations:
UPDATE booking_accommodation SET active = false WHERE id IN (11162, 11314, 11319);

This will free bed 179 for new assignments.

Risk: accommodations. Reversible. Blast radius: 1 bed freed.

Status: UNCHANGED — awaiting Neil action. Last checked: Wed 5 Aug 2026 UTC (122nd check).
See also: issue-12-addendum-4aug.md for full context.
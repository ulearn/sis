ISSUE 43 - Jesus Manuel Ramirez Diaz / Bed 83 (new active occupants found)
Reporter: KC | Sheet row: 45 | 25th check Wed 12 Aug 2026 UTC

Symptom: Jesus Manuel accommodation dates should be 20 Jun to 4 Jul. Bed 83 has stale active BAs.

Root Cause (updated 12 Aug - same as Issue 37, bed 83):
Bed 83 has 7 active BAs; 2 non-stale:
  BA 11173 (current, Aug 9-30), BA 25 (future, Aug 30-Oct 11)

Five stale: 11239 (80d), 11168 (53d), 11285 (38d, fee null), 11352 (32d), 11179 (3d).
Original issue BA 11285 (Jesus Manuel, bk 17825): ended 5 Jul 2026, fee = null.

Fix Recipe (NOT YET RUN):
  Same as Issue 37:
  UPDATE booking_accommodations SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);
  Confirm BA 11285 fee first. Do NOT touch BA 11173 or BA 25.

Risk: Bookings/Accommodation - reversible. See issue-37-addendum-12aug-b.md.
Status: OPEN - not run. Same fix as Issue 37.
Last checked: Wed 12 Aug 2026 UTC (25th check)
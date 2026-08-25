# Issue 43 - Jesus Manuel Ramirez Diaz (Bed 83)
Reporter: KC | Row 45 | 500th run Mon 24 Aug 2026 UTC

## Root cause
BA 11285 (Jesus Manuel Ramirez Diaz, bed 83) ended 5 Jul 2026, active = true — 50 days stale, fee = null.
This is one of 5 stale BAs on bed 83 (see issue-37-addendum-24aug.md for full list).
Next occupant (BA 25, Rosa Maria Mollica) starts bed 83 on 30 Aug 2026 = 6 DAYS AWAY.

## Fix recipe (NOT YET RUN)

See issue-37-addendum-24aug.md — single combined fix for all 5 stale BAs on bed 83:

  UPDATE booking_accommodation SET active = false
  WHERE id IN (11239, 11168, 11285, 11352, 11179);

## Risk
- Category: bookings / accommodation
- Reversible: yes
- DEADLINE: 30 Aug 2026 (6 days)

## Last checked
500th run Mon 24 Aug 2026 UTC

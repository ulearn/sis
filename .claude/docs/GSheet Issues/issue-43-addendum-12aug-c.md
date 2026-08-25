# Issue 43 - Jesus Manuel Ramirez Diaz / Bed 83 (26th check 12 Aug 2026)

Reporter: AC  Area: Booking/Accomm  Sheet row: 45

## Symptom
Accommodation dates incorrect (Jun 20 to Jul 4). Part of same bed-83 stale-BA cluster as Issue 37.

## Root Cause (unchanged)
Same 5 stale BAs on bed 83 as Issue 37 (row 39).
Jesus own BA: BA 11285, ended 5 Jul 2026, 38 days stale, fee=null.
Current occupant: BA 11173 (Alessandro Signorotti, 9-30 Aug 2026).
Future: BA 25 (Rosa Maria Mollica, 30 Aug - 11 Oct 2026).

## Fix Recipe - NOT YET RUN
See issue-37-addendum-12aug-c.md for full recipe.
Confirm BA 11285 fee (null) then deactivate all 5 stale BAs.
  UPDATE booking_accommodations SET active=false WHERE id IN (11239,11168,11285,11352,11179);

## Risk
Category: data-hygiene/bookings. Reversible. Blast radius: 5 BA records.

## Status
Fix NOT RUN. Unchanged 26 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC (26th check, run 221)
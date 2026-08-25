# Issue 50 — Stale 2026 Booking Accommodations (507th run addendum)
Reporter: KC | Row 52 | Updated: 507th run Mon 24 Aug 2026 ~21:08 UTC

## Count history
- Run 492 (Sun 23 Aug): 152
- Run 500 (Mon 24 Aug, ~13:07 UTC): 158 (+6)
- Run 507 (Mon 24 Aug, ~21:08 UTC): 152 (-6 unexplained)

## Still active at run 507
All 9 BAs from run 500 new-stale list confirmed still active:
- BA 11372: Aleix Cervera Gonzalez, bed 186, ended 23 Aug, EUR 750
- BA 11160: Maicol Moretti, bed 174, ended 22 Aug, EUR 420
- BA 11177: Andres Rodriguez Vargas, bed null, ended 22 Aug, EUR 200
- BA 11340: Theodore Bolt, bed 88, ended 22 Aug, EUR 1
- BA 11311: Pietro Caccianiga, bed 84, ended 22 Aug, EUR 3,850 (also issue 36)
- BA 11387: Vincenzo Gagliano, bed 89, ended 22 Aug, fee null (also issue 41)
- BA 11395: Bader Fareed Al Jurbua, bed 59, ended 22 Aug, EUR 250
- BA 11161: Lucia Borroni, bed 168, ended 22 Aug, EUR 420
- BA 11396: Giampaolo Russo, bed 44, ended 22 Aug, fee null (also issue 41)

Net -6 from run 500 to run 507: likely 6 other 2026 BAs deactivated in normal operations.

## Fix recipe (NOT YET RUN)
Table name is booking_accommodations (plural — important, not booking_accommodation).

  SELECT COUNT(*) FROM booking_accommodations
  WHERE active = true AND end_date < CURRENT_DATE AND start_date >= '2026-01-01';
  -- Expected: ~152

  UPDATE booking_accommodations
  SET active = false
  WHERE active = true AND end_date < CURRENT_DATE AND start_date >= '2026-01-01';

BA 11177 (bed null) is safe to include in the batch.

## Risk
- Category: bookings / accommodation
- Reversible: yes (UPDATE SET active=true to undo)
- Blast radius: ~152 rows, all historical 2026 records

## Status: Fix NOT RUN
Last checked: 507th run Mon 24 Aug 2026 UTC
# Issue 50 - Stale 2026 Booking Accommodations
Reporter: KC | Row 52 | 500th run Mon 24 Aug 2026 UTC

## Root cause
Stale active BA count (2026 only): 152 -> 158 (+6 since 492nd check)

Newly stale this week (ended Aug 17-23, still active):
- BA 11372: Aleix Cervera Gonzalez, bed 186, ended 23 Aug, fee EUR 750
- BA 11160: Maicol Moretti, bed 174, ended 22 Aug, fee EUR 420
- BA 11177: Andres Rodriguez Vargas, bkId 84, bed null, ended 22 Aug, fee EUR 200
  (CORRECTION: prior H had wrong student -- was Maicol, is Andres Rodriguez Vargas)
- BA 11340: Theodore Bolt, bed 88, ended 22 Aug, fee EUR 1
- BA 11311: Pietro Caccianiga, bed 84, ended 22 Aug, fee EUR 3,850
- BA 11387: Vincenzo Gagliano, bed 89, ended 22 Aug, fee null (also in issue 41)
- BA 11395: Bader Fareed Al Jurbua, bed 59, ended 22 Aug, fee EUR 250
- BA 11161: Lucia Borroni, bed 168, ended 22 Aug, fee EUR 420
- BA 11396: Giampaolo Russo, bed 44, ended 22 Aug, fee null (also in issue 41)

## Fix recipe (NOT YET RUN)

Batch deactivate all stale 2026 BAs:

  UPDATE booking_accommodation
  SET active = false
  WHERE active = true
    AND end_date < CURRENT_DATE
    AND start_date >= date 2026-01-01;

Verify first: SELECT COUNT(*) count FROM booking_accommodation
  WHERE active = true AND end_date < CURRENT_DATE AND start_date >= date 2026-01-01;

Expected count: ~158. BA 11177 (bed null) safe to deactivate.

## Risk
- Category: bookings / accommodation
- Reversible: yes (SET active = true to undo)
- Blast radius: 158 rows, all historical

## Last checked
500th run Mon 24 Aug 2026 UTC (confirmed count 158)

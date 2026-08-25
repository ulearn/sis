Issue 50 addendum 20 Aug 2026 B - Stale Active Booking Accommodations
Reporter: XX | Area: Booking/Accomm | Sheet row: 52 | Run: 13th

COUNT CHANGE: 36 -> 61 bed-assigned stale Booking Accommodations

Previous (12th check midnight UTC): 36 total (31 with bed + 5 without bed)
Current (13th check): 61 with bed + 5 without bed = 66 stale active BAs total

WHAT CHANGED:
- 31 newly discovered bed-assigned stale BAs (ended Mar-Jun 2026, below previous query cutoff)
- The 5 no-bed BAs (11230, 11362, 11276, 11174, 11347) remain active and stale - unchanged
- None of the 30 previously-tracked bed-assigned BAs have been deactivated

NEW 31 BED-ASSIGNED BAs (ended Mar-Jun 2026):
BA 11165 bed 189 ended 2026-06-27 fee EUR 575 booking 94
BA 11280 bed 188 ended 2026-06-27 fee null booking 17912
BA 11168 bed 83  ended 2026-06-20 fee EUR 700 booking 92
BA 11180 bed 84  ended 2026-06-20 fee EUR 400 booking 81
BA 30    bed 33  ended 2026-06-14 fee EUR 5000 booking 17826
BA 33    bed 89  ended 2026-06-07 fee EUR 400 booking 17821
BA 11228 bed 88  ended 2026-06-06 fee EUR 6800 booking 34
BA 11314 bed 179 ended 2026-06-06 fee EUR 480 booking 18002
BA 11246 bed 161 ended 2026-06-06 fee EUR 1070.59 booking 17
BA 11282 bed 66  ended 2026-06-05 fee EUR 720 booking 17897
BA 9915  bed 156 ended 2026-05-31 fee EUR 360 booking 1276
BA 9916  bed 180 ended 2026-05-30 fee EUR 960 booking 1275
BA 11159 bed 84  ended 2026-05-30 fee EUR 386.67 booking 100
BA 11239 bed 83  ended 2026-05-24 fee EUR 1050 booking 22
BA 11178 bed 87  ended 2026-05-24 fee EUR 1200 booking 83
BA 11164 bed 89  ended 2026-05-24 fee EUR 400 booking 95
BA 11162 bed 179 ended 2026-05-23 fee EUR 1140 booking 97
BA 11235 bed 156 ended 2026-05-17 fee EUR 200 booking 26
BA 9914  bed 178 ended 2026-05-17 fee EUR 360 booking 1276
BA 11158 bed 66  ended 2026-05-17 fee EUR 193.33 booking 100
BA 11234 bed 157 ended 2026-05-17 fee EUR 200 booking 27
BA 11233 bed 173 ended 2026-05-17 fee EUR 200 booking 28
BA 9917  bed 84  ended 2026-05-16 fee EUR 2000 booking 1274
BA 11157 bed 84  ended 2026-05-10 fee EUR 100 booking 100
BA 9906  bed 157 ended 2026-05-10 fee EUR 220 booking 1604
BA 11229 bed 89  ended 2026-05-09 fee EUR 1600 booking 33
BA 11264 bed 156 ended 2026-05-09 fee null booking 79
BA 11216 bed 66  ended 2026-05-09 fee EUR 1440 booking 46
BA 11185 bed 182 ended 2026-05-03 fee EUR 960 booking 77
BA 9905  bed 47  ended 2026-05-03 fee EUR 220 booking 1604
BA 11183 bed 89  ended 2026-03-06 fee EUR 2400 booking 79  (oldest - 167 days stale)

NEW NULL-FEE BAs:
Two new null-fee BAs in the newly discovered list:
  BA 11280 (bed 188, ended Jun 27 2026, booking 17912)
  BA 11264 (bed 156, ended May 9 2026, booking 79)

Total null-fee stale active BAs now 11 (was 9):
  With bed: 11371, 11394, 11338, 11265, 11285, 11339, 11354, 11280, 11264
  Without bed: 11276, 11347

FIX RECIPE (NOT YET RUN):

Step 1 - Confirm null-fee amounts with Diego/KC for all 11 null-fee BAs before deactivating.
  SQL (read-only): SELECT id, bed_id, start_date, end_date, fee, booking_id
    FROM booking_accommodations
    WHERE id IN (11371,11394,11338,11265,11285,11339,11354,11280,11264,11276,11347)
    ORDER BY end_date DESC;

Step 2 - Deactivate 52 bed-assigned stale BAs with confirmed fees (NOT YET RUN):
  UPDATE booking_accommodations SET active = false, updated_at = NOW()
  WHERE active = true AND end_date < 2026-08-20 AND bed_id IS NOT NULL
  AND id NOT IN (11371,11394,11338,11265,11285,11339,11354,11280,11264);

Step 3 - After fees confirmed: deactivate each null-fee BA individually (NOT YET RUN):
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = N;

Step 4 - Deactivate 5 no-bed stale BAs after checkout confirmed (NOT YET RUN):
  UPDATE booking_accommodations SET active = false, updated_at = NOW()
  WHERE id IN (11230,11362,11276,11174,11347);

Step 5 - Fix checkout window code (NOT YET RUN): see issue-50-checkout-double-submit.md

RISK: data-hygiene | Reversible | Blast radius: accommodation UI, checkout, bed availability
Financial: 29 of 31 new BAs have fees set; confirm fees on 11280 and 11264 before deactivating.

STATUS: Open - Fix NOT RUN. Last checked: 2026-08-20 UTC (13th run)

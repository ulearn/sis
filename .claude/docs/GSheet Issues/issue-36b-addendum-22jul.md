Issue 36b Addendum 22 Jul 2026 - 14 Tracked Stale BAs Still Active + 2 New

Sheet row: 38 | Check: 40th hourly Wed 22 Jul 2026 UTC

All 14 previously tracked BAs remain active (stale day counts updated to Wed 22 Jul):
  BA9917  bed=84  ended 2026-05-16  67d stale
  BA11246 bed=161 ended 2026-06-06  46d stale
  BA30    bed=33  ended 2026-06-14  38d stale
  BA11165 bed=189 ended 2026-06-27  25d stale
  BA11278 bed=190 ended 2026-06-27  25d stale
  BA11280 bed=188 ended 2026-06-27  25d stale
  BA11354 bed=186 ended 2026-06-28  24d stale
  BA11167 bed=168 ended 2026-07-04  18d stale
  BA11247 bed=161 ended 2026-07-04  18d stale
  BA11339 bed=59  ended 2026-07-04  18d stale
  BA11345 bed=89  ended 2026-07-12  10d stale
  BA11257 bed=168 ended 2026-07-18  4d  stale
  BA11365 bed=174 ended 2026-07-18  4d  stale
  BA11265 bed=157 ended 2026-07-19  3d  stale

2 new stale BAs with real bed assignments found:
  BA11180 bed=84  ended 2026-06-20  32d stale | Daniela Perozo Gil bk=81
  BA11168 bed=83  ended 2026-06-20  32d stale | Diego Da Silva Saldanha bk=92
(BA11285 bed=83 and BA11352 bed=83 already covered by issues 37 and 43)

System-wide real stale BAs (end 2000-2026, active=true): 11,112

Fix recipe (NOT YET RUN):
1. Run in DB (safe batch deactivation):
   UPDATE booking_accommodation SET active=false
   WHERE id IN (9917,11246,30,11280,11167,11247,11339,11345,11257,11365,11265,11165,11278,11354,11180,11168)
   AND active=true;
2. Also batch with issues 37 and 43: include BA11285 and BA11352 in same UPDATE.
3. Schedule nightly deactivation job for 11k+ system-wide stale BAs.

Risk: Data hygiene. Reversible (set active=true to restore). 16 bed records to free.

Status: OPEN - Fix NOT RUN
Last checked: Wed 22 Jul 2026 UTC
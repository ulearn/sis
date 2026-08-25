Issue 45 - Stale Active Booking Courses: Count 24479 (+13) (36th check, Sat 8 Aug 2026 UTC)

Reporter: (system) | Area: Renewal student / class | Sheet row: 47

SYMPTOM: 24479 Booking Courses active=true with endDate in the past. Count INCREASED +13 since yesterday (was 24466).

ROOT CAUSE (live 2026-08-08 UTC):
  Total stale active Booking Courses: 24479 (up +13 from 24466 yesterday)
  Most recently ended (still active): BC 88 (Morning General, bookingId=82, ended 2026-08-07 = yesterday)
  The +13: Booking Courses that reached endDate on Aug 7 and were not deactivated
  No deactivation routine running - count will keep growing daily

FIX RECIPE (NOT YET RUN):
  Step 1 - Preview: SELECT COUNT(*) FROM BookingCourse WHERE active = true AND endDate < NOW();
  Step 2 - After Neil approves: UPDATE BookingCourse SET active = false WHERE active = true AND endDate < NOW();
  Safer alternative: deactivate in batches by date range for inspection and rollback.

RISK: Data hygiene - large blast radius (24479 rows); reversible; no financial impact. Awaiting Neil go/no-go.
Status: OPEN - Awaiting decision. Fix NOT RUN.
Last checked: 2026-08-08 UTC (36th hourly check) - count up +13 vs yesterday
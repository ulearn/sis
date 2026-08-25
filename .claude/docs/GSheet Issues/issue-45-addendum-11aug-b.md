ISSUE 45 — Mass Stale Booking Course Deactivation (62nd Check)

Reporter: AC | Sheet row: 47 | Check: 62nd Tue 11 Aug 2026 UTC

Current state:
• Total active Booking Courses: 24,763
• Stale (ended before 2026-08-11): 24,479 (98.9%)
• Current (ending 2026-08-11 or later): 284 (+1 from yesterday)
• Fix still pending — mass deactivation not yet run.

Fix (NOT YET RUN):
1. Pre-check count:
   SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date < CURRENT_DATE;
   Expected: ~24,479
2. Mass deactivate:
   UPDATE booking_courses SET active=false, updated_at=NOW()
   WHERE active=true AND end_date < CURRENT_DATE;
3. Verify after:
   SELECT COUNT(*) FROM booking_courses WHERE active=true;
   Expected: ~284

Pre-condition: Confirm active=true on stale BC is not used as billing/report sentinel.
Risk: data-hygiene. Reversible: yes (can re-activate by timestamp). Blast: HIGH row count (24,479) but all provably ended.
Status: 24,479 stale unchanged. Awaiting Neil approval. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (62nd check)
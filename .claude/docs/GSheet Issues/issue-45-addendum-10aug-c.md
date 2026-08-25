Issue 45 — Mass Stale Booking Courses (Addendum 10 Aug 2026, run c)

Reporter: AC | Area: Renewal students | Sheet row: 47

Root Cause (58th check, Mon 10 Aug 2026 UTC — unchanged):
- Total active Booking Courses: 24,763
- Stale (endDate before 2026-08-10): 24,479 — 98.9% of all active BCs are stale
- Current (endDate on or after 2026-08-10): 283
- Root cause: bulk Fidelo migration imported historical BCs as active = true; deactivation not yet run
- Impact: arrivals list and other SIS queries include thousands of stale records

FIX RECIPE — NOT YET RUN
Mass-deactivate all active Booking Courses where endDate < today.

Step 1 — count first (verification):
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < NOW();
Expected: ~24,479

Step 2 — deactivate (NOT YET RUN):
  UPDATE booking_courses SET active = false WHERE active = true AND end_date < NOW();

Step 3 — verify after:
  SELECT COUNT(*) FROM booking_courses WHERE active = true;
Expected: ~283

Risk: data-hygiene. Reversible (can re-activate). Blast radius = 24,479 rows.
Neil should run this when comfortable — no students are affected (these are all past courses).
Status: Open — 24,479 stale BCs, fix not run.
Last checked: Mon 10 Aug 2026 UTC (58th check)
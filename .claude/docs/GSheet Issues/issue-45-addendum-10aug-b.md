# Issue 45 — Mass Stale Booking Course Deactivation (56th check, Mon 10 Aug 2026)

**Reporter:** AC | **Area:** Renewal Students | **Sheet row:** 47

## Symptom
Returning students not appearing on arrivals list; class assignment views polluted with historical records.

## Root Cause
- 24,479 active Booking Courses with end_date < 2026-08-10 — unchanged from 55th check (earlier today)
- Only 283 genuinely current active Booking Courses (ending on or after today)
- Total: 24,762 active records — 98.9% are stale
- Mass deactivation not yet run; count unchanged for many weeks

## Fix Recipe (NOT YET RUN)

Verification (read-only):
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
  -- Expected: 24,479

  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date >= CURRENT_DATE;
  -- Expected: 283

Mass deactivation (NOT YET RUN):
  UPDATE booking_courses SET active = false
  WHERE active = true AND end_date < CURRENT_DATE;
  -- Returns approx 24,479 rows updated

Verify after:
  SELECT COUNT(*) FROM booking_courses WHERE active = true;
  -- Expected: ~283

Recommended: Run in off-hours (before 8am or after 6pm Irish time). Use a transaction with rollback on unexpected counts.

## Risk / Category
**data-hygiene** — Fully reversible (UPDATE active = true to undo). Blast radius: 24,479 rows. No financial impact.

## Status
**Open — NOT YET RUN.** Last checked: Mon 10 Aug 2026 UTC (56th hourly check). Count unchanged at 24,479.

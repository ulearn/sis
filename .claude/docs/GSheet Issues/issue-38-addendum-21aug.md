# Issue 38 Addendum 21 Aug 2026 (Evening) — BC25043 Stale

Reporter: | Area: Booking Course | Sheet row: 40

Root cause (196th check, Fri 21 Aug 2026 evening — no change since 195th morning):

- Booking Course 25043 (General English PM, booking 18265): ended 14 Aug 2026 — 7 days stale, active = true
- 0 class assignments on this Booking Course — safe to deactivate with no side effects
- Fix NOT RUN

Fix recipe (NOT YET RUN):

Step 1 — Deactivate BC25043:
  UPDATE booking_course SET active = false, "updatedAt" = NOW() WHERE id = 25043;

Step 2 — Verify:
  SELECT id, name, "endDate", active FROM booking_course WHERE id = 25043;
  Expect: active=false

Risk: data-hygiene | Reversible: yes | Blast radius: 1 booking course record
Status: Open. BC25043 7 days stale. Fix NOT RUN.
Last checked: 2026-08-21 Fri evening (196th check)

Issue 21 - Maurivan Kuhl BC1604 stale (24th check)
Reporter: AC | Area: Booking/Class | Sheet row: 22 | Sun 16 Aug 2026 UTC

Root Cause (24th check - 16 Aug 2026 UTC)
- Booking Course 1604 (Morning General, booking 1461, student 912 Maurivan Kuhl): ended Jul 3 2026 - 44 days stale, active = true
- No change since 23rd check (Sat 15 Aug 2026)
- Low priority: student not currently enrolled; no scheduling impact

Fix Recipe (NOT YET RUN)

  UPDATE booking_courses SET active = false WHERE id = 1604;

Risk: data-hygiene; reversible; single record; safe

Status: Open - Fix NOT RUN (low priority)
Last checked: 2026-08-16 UTC (24th check)
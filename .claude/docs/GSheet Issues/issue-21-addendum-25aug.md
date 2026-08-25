Issue 21 Addendum 25 Aug 2026

32nd check Tue 25 Aug 2026 UTC
Booking Course 1604 (Morning General, Maurivan Kuhl): ended 2026-07-03, active = true — 53 days stale
2 class assignments (SCA ids 46, 156): last week-start 2026-04-06 to week-end 2026-07-02 — historical only
No change from 31st check (Mon 24 Aug).

Fix (NOT YET RUN):
UPDATE booking_courses SET active = false WHERE id = 1604;
Verify student no longer appears in current week class assignments.

Risk: data-hygiene | reversible | Maurivan Kuhl only | low priority
Status: Open. Last checked: 2026-08-25 UTC (520th run, 32nd issue check)
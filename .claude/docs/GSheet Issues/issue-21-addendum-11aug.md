# Issue 21 — Maurivan Kuhl — Addendum 11 Aug 2026

**Sheet row:** 22 | **Reporter:** PG | **Area:** Booking / Class | **Check:** 19th hourly Tue 11 Aug 2026 UTC

Symptom: Student appears in A1 AM and A2 AM for WB 11 May 2026 — should only be in A2 AM.

Root Cause (unchanged): BC 1604 (Morning General, booking 1461, student 912 Maurivan Kuhl) ended 3 Jul 2026 but active = true. Now 39 days stale.

Current State (11 Aug 2026):
- BC 1604: endDate = 2026-07-03, active = true — 39 days stale (was 38d Mon 10 Aug)
- No SCAs on BC 1604 — safe to deactivate
- No change from previous check

Fix Recipe (NOT YET RUN):
  UPDATE "BookingCourse" SET active = false WHERE id = 1604;

Risk: data-hygiene | reversible: yes | blast radius: single BC, no SCAs | urgency: low

Status: Open — fix NOT RUN. Day 39.
Last checked: Tue 11 Aug 2026 UTC
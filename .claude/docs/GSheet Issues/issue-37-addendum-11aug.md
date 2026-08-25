# Issue 37 — Veronica Martin (ID 278) — Addendum 11 Aug 2026

**Sheet row:** 39 | **Reporter:** KC | **Area:** Booking / Accommodation | **Check:** 21st hourly Tue 11 Aug 2026 UTC

Symptom: Student paid for a week accommodation in Capel, not appearing in SIS accommodation allocation.

Root Cause (unchanged): 5 Booking Accommodations on bed 83 remain active=true after end dates. BA 11285 has fee=null.

NEW this check: BA 11179 ended 9 Aug 2026 — now 2 days stale.

Current State (11 Aug 2026):

BA 11239: bed 83, 3 May - 24 May 2026, active=true, fee EUR 1,050 — 79 days stale
BA 11168: bed 83, 6 Jun - 20 Jun 2026, active=true, fee EUR 700 — 52 days stale
BA 11285: bed 83, 21 Jun - 5 Jul 2026, active=true, fee=null — 37 days stale
BA 11352: bed 83, 4 Jul - 11 Jul 2026, active=true, fee EUR 360 — 31 days stale
BA 11179: bed 83, 12 Jul - 9 Aug 2026, active=true, fee EUR 1,360 — 2 days stale (NEW)

Fix Recipe (NOT YET RUN):

Step 1 — Set missing fee on BA 11285:
  UPDATE "BookingAccommodation" SET fee = <correct_amount> WHERE id = 11285;
  (Check booking/deal for correct 2-week Capel rate, 21 Jun - 5 Jul 2026.)

Step 2 — Deactivate all 5 stale BAs:
  UPDATE "BookingAccommodation" SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);

Risk: data-hygiene | reversible: yes | blast radius: 5 BAs on bed 83 | urgency: low-medium

Status: Open — fix NOT RUN. 5 stale BAs (max 79d). BA 11179 freshly stale (2d).
Last checked: Tue 11 Aug 2026 UTC
# Issue 10 — Massimiliano Cameran: Missing Cert + Stale BCs (49th check, Wed 12 Aug 2026 UTC)
Reporter: AC | Area: Doc Gen / Certs | Sheet row: 11

## Status
Unchanged from 48th check (Tue 11 Aug 2026). Booking Course 107 now 82 days stale; Booking Course 24793 now 68 days stale.

## Root Cause
- Booking 97 (Massimiliano Cameran, student 91): CONFIRMED, confirmed = false, EUR 1,741 paid, EUR 0 open — unchanged (last DB update 2026-06-05)
- No completion certificate on booking 97: DR 63 (invoice, REVOKED) + DR 64 (invoice, ISSUED) only
- DR 179 (Certificate of Completion, ISSUED 5 Jun 2026): on booking 18002, NOT booking 97
- Booking Course 107 (Morning General, ended 22 May 2026): active = true — 82 days stale, booking 97, 1 class assignment (id 235)
- Booking Course 24793 (General English AM, ended 5 Jun 2026): active = true — 68 days stale, booking 18002, 1 class assignment (id 374)

## Fix Recipe (NOT YET RUN)
Step 1 — Set booking 97 confirmed = true:
  UPDATE booking SET confirmed = true WHERE id = 97;

Step 2 — Verify class assignment 235 (BC 107) is historical, then deactivate:
  UPDATE booking_course SET active = false WHERE id = 107;

Step 3 — Verify class assignment 374 (BC 24793) is historical, then deactivate:
  UPDATE booking_course SET active = false WHERE id = 24793;

Step 4 — Generate completion certificate for booking 97 via SIS Admin
  (Morning General course ended 22 May 2026).

## Risk / Category
Documents / bookings / data-hygiene. Reversible. Blast radius: students on bookings 97 and 18002.

## Status: Open — fix NOT RUN.
## Last checked: 2026-08-12 UTC
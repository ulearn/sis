# Issue 10 — Massimiliano Cameran: Missing Cert + Stale BCs (48th check, Tue 11 Aug 2026 UTC)
Reporter: Staff | Area: Doc Gen / Certs | Sheet row: 11

## Status
Unchanged from 47th check (Mon 10 Aug 2026).

## Root Cause
- Booking 97 (Massimiliano Cameran, student 91): CONFIRMED, confirmed = false, EUR 1,741 paid, EUR 0 open
- No completion certificate on booking 97: DR 63 (invoice, REVOKED) + DR 64 (invoice, ISSUED) only
- DR 179 (Certificate of Completion, ISSUED 5 Jun 2026): on booking 18002, NOT booking 97
- Booking Course 107 (Morning General, ended 22 May 2026): active = true — 81 days stale, booking 97
- Booking Course 24793 (General English AM, ended 5 Jun 2026): active = true — 67 days stale, booking 18002

## Fix Recipe (NOT YET RUN)
Step 1 — Set booking 97 confirmed = true:
  UPDATE Booking SET confirmed = true WHERE id = 97;

Step 2 — Deactivate Booking Courses 107 + 24793:
  UPDATE BookingCourse SET active = false WHERE id IN (107, 24793);

Step 3 — Generate completion certificate for booking 97 via SIS Admin
  (template 82 - Certificate of Completion, Morning General, ended 22 May 2026).

## Risk / Category
Documents / bookings / data-hygiene. Reversible. Blast radius: student 91 only.

## Last checked: 2026-08-11 UTC
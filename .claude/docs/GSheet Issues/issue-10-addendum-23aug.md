# Issue 10 — Massimiliano Cameran — Missing Cert / Stale BC — 60th check

Reporter: AC | Sheet row: 11 | Last checked: 2026-08-23 UTC

## Root Cause (no change since 59th Sat 22 Aug)
Confirmed via Prisma 2026-08-23 UTC:
- Booking 97 (student 91): CONFIRMED, confirmed = false (anomaly). amountPaid = EUR 1,741, amountOpen = EUR 0. Paid in full but confirmed=false blocks class assignment and cert generation.
- Booking Course 107 (Morning General): active = true, ended 2026-05-22 — 93 days stale, 1 class assignment.
- Documents: doc 63 REVOKED (Invoice), doc 64 ISSUED (Invoice). No Certificate of Completion exists.

## Fix Recipe (NOT YET RUN)
Step 1: UPDATE "Booking" SET confirmed = true WHERE id = 97;
Step 2: Check SCA on BC 107: SELECT id, week_start, week_end FROM "StudentClassAssignment" WHERE booking_course_id = 107;
  If historical: UPDATE "BookingCourse" SET active = false WHERE id = 107;
Step 3: Generate and issue Certificate of Completion for booking 97 via SIS doc UI.
Undo step 1: UPDATE "Booking" SET confirmed = false WHERE id = 97;

## Risk
Documents + data hygiene. Reversible. Low blast radius.

## Status
Fix NOT RUN. confirmed = false for 60+ days. No certificate issued. BC 107 93d stale.
Last checked: 2026-08-23 UTC (60th check).
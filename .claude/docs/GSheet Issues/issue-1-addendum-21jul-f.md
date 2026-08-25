# Issue 1 — Orphan Payments + Stale BCs/BAs (Addendum 21 Jul, run f)
Reporter: NM | Area: Cleanup | Sheet row 2 | 33rd hourly check (89th total) Tue 21 Jul 2026 UTC

## Symptom
Payments with no booking linkage; 24k+ stale booking courses and 11k+ stale accommodations still active.

## Current Status (fresh DB, no change from run e at 18:15)

Orphan Payments (bookingId=null):
- Payment 4781: EUR 380, Flywire, 20 Aug 2019, xeroId=null (legacy)
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026, xeroId=null (84 days)
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026, xeroId=null (84 days)
- Payment 17187: EUR 6151, TransferMate Escrow, 1 May 2026, xeroId=null (81 days)
Total unlinked non-legacy: EUR 6,830.80

Stale Booking Courses: 24,436 (active=true, endDate < 2026-07-21)
Stale Booking Accommodations: 11,175 (active=true, endDate < 2026-07-21)

## Fix Recipe (NOT YET RUN)
See full recipe: issue-1-orphan-payments.md

Orphan payments: investigate 16988, 16989, 17187 — find the booking and link, or void if unmatched.

Stale deactivation (run after DB backup):
  UPDATE "BookingCourse" SET active = false WHERE active = true AND "endDate" < NOW();
  UPDATE "BookingAccommodation" SET active = false WHERE active = true AND "endDate" < NOW();
  -- NOT YET RUN

## Risk / Category
- Category: money (orphan payments), data-hygiene (stale BCs/BAs)
- Reversible: yes
- Blast radius: 24,436 BCs + 11,175 BAs (batch); orphan payments individual

## Status
OPEN — 33rd hourly check, no fix run yet.
Last checked: 2026-07-21 UTC
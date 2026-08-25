# Issue 30 — Giulia/Milena: Stale BC + Xero Gaps (134th check Fri 21 Aug 2026)

**Reporter:** ST | **Area:** Booking / Accounts | **Sheet row:** 31

## Root Cause (live DB, Fri 21 Aug 2026)

- BC 104 (Morning General Plus): active, ended 2026-06-26 — 56 days stale
- Payment 17102 (bk94): EUR 1,151.50, xeroPaymentId = null — paid 2026-03-13 — 161 days unreconciled
- Payment 945 (bk79): EUR 4,231, xeroPaymentId = null — paid 2026-01-30 — 203 days unreconciled

## Fix Recipe (NOT YET RUN)

1. UPDATE booking_course SET active = false WHERE id = 104
2. Find Xero payment EUR 1,151.50 ~Mar 13 2026 bk94; UPDATE payment SET "xeroPaymentId" = '<id>' WHERE id = 17102
3. Find Xero payment EUR 4,231 ~Jan 30 2026 bk79; UPDATE payment SET "xeroPaymentId" = '<id>' WHERE id = 945
4. Review Milena Vinci student record (guardian, not student) — check for booking/doc refs before removal

## Risk
- Category: bookings + accounts + data-hygiene | Reversible | Low blast radius

## Status
No change. Fix NOT RUN. BC104 56d stale; payments 161d+203d unreconciled.
**Last checked:** 2026-08-21 UTC (134th check)
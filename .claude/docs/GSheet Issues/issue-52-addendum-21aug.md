# Issue 52 — Host Email Not Auto-Populated in To: Field (Fri 21 Aug 2026)

**Reporter:** KC | **Area:** Booking / Accomm | **Sheet row:** 54

## Root Cause (codebase + DB, Fri 21 Aug 2026)

- admin.html comms block (~lines 4430-4465): To: field populates student email only
- Quick-pick badge selects Host Arrival template but does not switch To: to host email
- No mechanism to derive host email from active BA to AccommodationProvider
- BA 11399 (Fanny Scelles, bk17843): fee = null, starts 4 Oct 2026 (44 days), ends 19 Dec 2026

## Fix Recipe (NOT YET RUN)

1. Add Host badge to To: field in admin.html (~line 4464):
   On click: look up active BA for student -> bedId -> room -> property -> provider -> populate To: with provider.email
2. Set fee on BA 11399: once amount confirmed from bk17843 breakdown,
   UPDATE booking_accommodation SET fee = <amount> WHERE id = 11399

## Risk
- Category: code (UI) + bookings (fee) | Reversible | Medium blast radius

## Status
BA 11399 fee null. To: field no host option. Fix NOT applied.
**Last checked:** 2026-08-21 UTC
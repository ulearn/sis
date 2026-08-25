# Issue 1 — Orphan Payments + Stale Booking Courses / Accommodations
Reporter: NM | Area: Cleanup | Sheet row: 2

## Root Cause (Fri 24 Jul 2026 UTC — 54th hourly, 147th total — UNCHANGED)
- Payment 16988 (EUR 339.90, Bank, 28 Apr 2026): bookingId=null — 87 days orphaned
- Payment 16989 (EUR 339.90, Bank, 28 Apr 2026): bookingId=null — 87 days orphaned
- Payment 17187 (EUR 6,151, TransferMate, 5 May 2026): bookingId=null, fideloPaymentId=37587, txId=D2026226 — 80 days orphaned
- Payment 4781 (EUR 380, Flywire, Apr 2019): fideloPaymentId=32056 — permanently unresolvable
- Stale booking courses: 24,436 — UNCHANGED from yesterday
- Stale booking accommodations: 11,176 — UP BY 1 from 11,175 yesterday

## Fix (NOT YET RUN)
1. Link pmts 16988/16989 to correct booking (check fins/ hub records)
2. Investigate pmt 17187 via fideloPaymentId=37587 / txId=D2026226
3. UPDATE BookingCourse SET active=false WHERE active=true AND endDate < NOW()
4. UPDATE BookingAccommodation SET active=false WHERE active=true AND endDate < NOW()

## Risk: Money EUR 6,831 unlinked — HIGH. Stale BCs/BAs — data hygiene.
## Status: UNCHANGED — stale BA +1 to 11,176. Fix NOT RUN. Fri 24 Jul 2026 UTC

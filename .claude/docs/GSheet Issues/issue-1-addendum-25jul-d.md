Issue 1 -- Orphan Payments + Stale BCs/BAs (addendum Sat 25 Jul 2026 UTC, 66th hrly)

Sheet row: 2 | Area: Cleanup

Current state (Sat 25 Jul 2026 UTC)

Orphan payments (bookingId=null): 4 -- UNCHANGED
ID 16988: EUR 339.90, Bank, Apr 28 2026, 89d orphaned, hubspotPaymentId=1204827374829
ID 16989: EUR 339.90, Bank, Apr 28 2026, 89d orphaned, hubspotPaymentId=1204846469317
ID 17187: EUR 6151.00, TransferMate Escrow, May 1 2026, 82d orphaned, fideloPaymentId=37587, transactionId=D2026226
ID 4781:  EUR 380.00, Flywire, Aug 2019, legacy/unresolvable, fideloPaymentId=32056

Stale BCs (active=true, endDate < now, booking.confirmed=true): 23,173 -- UNCHANGED
Same as all previous checks today. 12 BCs ended Jul 24 already included.
Note: raw all-bookings stale count (incl. unconfirmed) = 24,448.

Stale BAs (active=true, endDate < now, bedId not null): 43 -- UNCHANGED
Corrects earlier-today run which wrote 47. Current: 43 (same as Fri 24 Jul).

Status: UNCHANGED -- 4 orphan pmts (89d/82d); 23,173 stale BCs; 43 stale BAs
Last checked: Sat 25 Jul 2026 UTC

# Issue 1 Addendum -- Fri 31 Jul 2026 (119th check)
Area: Cleanup / Orphan Payments | Sheet row: 2

## Status
4 orphan payments unchanged. Same data as 118th check (same calendar day).

## Evidence (live DB)
Payment 16988: EUR 339.90, Bank, bookingId = null (94 days, HubSpot payment ID 1204827374829, created Apr 28 2026)
Payment 16989: EUR 339.90, Bank, bookingId = null (94 days, HubSpot payment ID 1204846469317, created Apr 28 2026)
Payment 17187: EUR 6,151, TransferMate Escrow, bookingId = null (87 days, Fidelo ID 37587, ref D2026226, created May 5 2026)
Payment 4781: EUR 380, Flywire 2019, bookingId = null (legacy ~7 years, Fidelo ID 32056)

## Fix recipe -- NOT YET RUN
For 16988 + 16989: Search HubSpot for payments 1204827374829 / 1204846469317; find associated deal; link booking_id in DB.
For 17187: Identify deal D2026226 in HubSpot; confirm booking; link payment 17187 to booking.
For 4781: Legacy Flywire 2019 -- likely uncollectable. Neil to decide: link or write off.

Risk: money -- reversible. Blast radius: 3-4 payment records.
Last checked: Fri 31 Jul 2026 UTC (119th check)
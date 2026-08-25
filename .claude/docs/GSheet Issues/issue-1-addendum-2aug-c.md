# Issue 1 — Orphan Payments (2 Aug 2026, check 130)

Reporter: NM | Area: Cleanup | Sheet row: 2

## Root Cause (130th check — 2 Aug 2026 UTC)
4 orphan payments unchanged:
- PMT 16988: EUR 339.90, Bank Transfer, HubSpot ID 1204827374829, created 28 Apr 2026 (96 days)
- PMT 16989: EUR 339.90, Bank Transfer, HubSpot ID 1204846469317, created 28 Apr 2026 (96 days)
- PMT 17187: EUR 6,151, TransferMate Escrow, fidelo 37587, TXN D2026226, created 5 May 2026 (89 days)
- PMT 4781: EUR 380, Flywire, fidelo 32056, TXN D20191404, created 2019 (~7 years)

Cross-ref Issue 48:
- Booking 17856 (Galbusera): CONFIRMED, confirmed=false, amountPaid EUR 339.90, 0 payment records
- Booking 17857 (Fassina): CONFIRMED, confirmed=false, amountPaid EUR 339.90, 0 payment records
- PMTs 16988+16989 almost certain match for bookings 17856+17857.

## Fix Recipe — NOT YET RUN

Step 1: Verify HubSpot IDs 1204827374829 + 1204846469317 belong to Galbusera + Fassina.

Step 2: Link payments (NOT YET RUN):
UPDATE payments SET booking_id = 17856 WHERE id = 16988;
UPDATE payments SET booking_id = 17857 WHERE id = 16989;
UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 3: Investigate PMT 17187 — search Hub fins/ for TXN D2026226 / fidelo 37587.

Step 4: PMT 4781 (~7 years) — consult Neil on archive/void.

## Risk: money | Reversible | Blast radius: 2 confirmed students (Galbusera, Fassina) + 1 unknown
## Status: Open — 4 orphans, 96d/89d/7yr
Last checked: 2 Aug 2026 UTC (check 130, 4th today)
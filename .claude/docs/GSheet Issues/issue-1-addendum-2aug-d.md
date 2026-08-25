Issue 1 — Orphan Payments (131st check, 5th today)

Reporter: NM | Area: Cleanup | Sheet row: 2

Symptom: 4 payments with booking_id = null remain unlinked.

Root cause (confirmed Sun 2 Aug 2026 UTC):
- Payment 16988: EUR 339.90, Bank, HubSpot payment ID 1204827374829, booking = null (97 days since Apr 28)
- Payment 16989: EUR 339.90, Bank, HubSpot payment ID 1204846469317, booking = null (97 days since Apr 28)
- Payment 17187: EUR 6151, TransferMate Escrow, fidelo_payment_id 37587, transaction ID D2026226, booking = null (90 days since May 1)
- Payment 4781: EUR 380, Flywire, transaction ID D20191404, booking = null (legacy ~7 years, payment_date Aug 2019)
- Bookings 17856 (Margherita Galbusera) + 17857 (Francesca Fassina): both CONFIRMED, confirmed=false, amount_paid=EUR 339.90 each, 0 payment records
- Cross-reference: payments 16988+16989 match the EUR 339.90 amounts on bk17856+17857 — likely the correct assignment

Fix recipe (NOT YET RUN):

Step 1 — Verify HubSpot payments 1204827374829 + 1204846469317:
  In HubSpot deal 17856 and 17857, confirm payment records match EUR 339.90 each
  Confirm student names match Galbusera and Fassina

Step 2 — Link payments to bookings:
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;

Step 3 — Confirm bookings after payment link:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 4 — Payment 17187 (EUR 6151): investigate via TransferMate / HubSpot for matching booking.
  Payment date May 1 2026. Search HubSpot deals for EUR 6151 around that date.

Step 5 — Payment 4781 (EUR 380, 2019): low priority legacy. Archive or link to historical booking if found.

Risk: Money; medium importance. Steps 2+3 reversible.

Status: Fix NOT RUN — 131st check, 5th today Sun 2 Aug 2026 UTC (97d/97d/90d/7yr)
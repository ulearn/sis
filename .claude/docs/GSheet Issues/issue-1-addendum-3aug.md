# Issue 1 — Orphan Payments (132nd check, 1st on Aug 3)
Sheet row: 2 | Reporter: NM | Area: Cleanup

Symptom
4 orphan payments (bookingId=null) with no booking link.

Root cause (Mon 3 Aug 2026 UTC):
- Payment 16988: EUR 339.90, Bank, HubSpot ID 1204827374829, bookingId=null — 98 days orphaned.
- Payment 16989: EUR 339.90, Bank, HubSpot ID 1204846469317, bookingId=null — 98 days orphaned.
- Payment 17187: EUR 6,151, TransferMate Escrow, fidelo payment 37587, transaction D2026226, bookingId=null — 91 days orphaned.
- Payment 4781: EUR 380, Flywire, transaction D20191404, bookingId=null — legacy, ~7 years orphaned.
- Bookings 17856 (Margherita Galbusera) + 17857 (Francesca Fassina): both CONFIRMED, confirmed=false, EUR 339.90 amountPaid, 0 payment records linked in SIS.
- Payments 16988+16989 (EUR 339.90 each, Bank) likely match bookings 17856+17857 — amounts identical.
- State unchanged from 2aug-d.

Fix recipe (NOT YET RUN — same as prior addendum):

Step 1 — Verify HubSpot payment IDs 1204827374829 + 1204846469317 match Galbusera + Fassina:
  Check HubSpot payments against bookings 17856 (Galbusera) and 17857 (Fassina) deal IDs.

Step 2 — Link payments 16988 + 16989 to bookings 17856 + 17857:
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;

Step 3 — Set confirmed=true on bookings 17856 + 17857 (once payments linked and verified):
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 4 — Payment 17187 (EUR 6151 TransferMate): investigate which booking this belongs to. Check HubSpot deal for transaction D2026226.

Step 5 — Payment 4781 (EUR 380 Flywire, 2019): legacy item — consider marking as voided or write-off after accounts review.

Risk/category: accounts (money) — reversible | blast radius: 2 students + 4 payments
Status: NOT RUN — 132nd check, 1st on Mon 3 Aug 2026 UTC

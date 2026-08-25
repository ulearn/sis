Issue 1 - Orphan Payments
Reporter: NM | Sheet row: 2
Last checked: 2026-07-30 UTC (114th check)

Root cause (NOT YET RUN):
4 payments with booking_id=null, all unchanged:
- Payment 4781: EUR 380, Flywire, 2019-08-20, source=FIDELO - legacy 2019
- Payment 16988: EUR 339.90, Bank, 2026-04-28, source=HUBSPOT - 94 days orphaned
- Payment 16989: EUR 339.90, Bank, 2026-04-28, source=HUBSPOT - 94 days orphaned
- Payment 17187: EUR 6151, TransferMate Escrow, 2026-05-01, source=FIDELO - 87 days orphaned
Payments 16988+16989: EUR 339.90 each same date - likely installments for a specific booking
Payment 17187: EUR 6151 large TransferMate escrow from Fidelo deal D2026226

Fix recipe (NOT YET RUN):
For payments 16988+16989 (EUR 339.90 each):
  Search HubSpot for deals with EUR 339.90 payments around 2026-04-28
  Identify booking, then:
  UPDATE payments SET booking_id=BOOKING_ID,updated_at=NOW() WHERE id IN (16988,16989);
For payment 17187 (EUR 6151, Fidelo D2026226):
  Find Fidelo deal D2026226 in HubSpot, identify booking ID
  UPDATE payments SET booking_id=BOOKING_ID,updated_at=NOW() WHERE id=17187;
For payment 4781 (2019 legacy):
  Low priority. Verify any legacy booking correspondence. If none, mark as unrecoverable.

Risk: money, data-hygiene. Reversible (SET booking_id=NULL to undo). Total EUR 7210.80 unlinked.
Status: NOT YET RUN - awaiting Neil approval. Last checked: 2026-07-30 UTC.
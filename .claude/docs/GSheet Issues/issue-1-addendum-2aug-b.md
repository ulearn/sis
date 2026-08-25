# Issue 1 - Orphan payments (4 unlinked)
Reporter: NM | Area: Cleanup | Sheet row: 2

Symptom: Payments with no booking_id (orphaned from migration or processing errors).

Root cause (129th check, 3rd today - Sun 2 Aug 2026 UTC):
4 orphan payments confirmed unchanged:
  ID 16988: EUR 339.90, Bank, hubspotId=1204827374829, paymentDate=Apr 28 2026 - 97 days orphaned
  ID 16989: EUR 339.90, Bank, hubspotId=1204846469317, paymentDate=Apr 28 2026 - 97 days orphaned
  ID 17187: EUR 6,151, TransferMate Escrow, fideloId=37587, txId=D2026226, paymentDate=May 1 2026 - 93 days
  ID 4781: EUR 380, Flywire, fideloId=32056, txId=D20191404, paymentDate=Aug 20 2019 - approx 7 years

Cross-reference: pmt 16988 likely matches bk 17856 (Galbusera, EUR 339.90, Apr 28, Bank).
Cross-reference: pmt 16989 likely matches bk 17857 (Fassina, EUR 339.90, Apr 28, Bank).
See Issue 48 for full fix recipe for these two.

Fix recipe (NOT YET RUN):

Payments 16988 + 16989 - see issue-48-addendum-2aug-f.md for full steps.
After HubSpot verification:
UPDATE payments SET booking_id = 17856 WHERE id = 16988;
UPDATE payments SET booking_id = 17857 WHERE id = 16989;

Payment 17187 (EUR 6,151 TransferMate Escrow, D2026226):
Look up transaction D2026226 in TransferMate/Fidelo records to identify the booking.
UPDATE payments SET booking_id = <booking_id> WHERE id = 17187;

Payment 4781 (EUR 380 Flywire, Aug 2019 - legacy):
Check Fidelo for booking linked to fideloId 32056 / txId D20191404.
If unrecoverable, this is a write-off decision for Neil.
SELECT id, fidelo_booking_id FROM bookings WHERE fidelo_booking_id IS NOT NULL LIMIT 20;

Risk: money, data-hygiene. Pmts 16988+16989 reversible after HubSpot verify (EUR 679.80 total).
Pmt 17187: high value (EUR 6,151); investigate carefully. Pmt 4781: legacy; Neil's call.
Status: OPEN. Fix NOT RUN. 4 orphans unchanged. Last checked: Sun 2 Aug 2026 UTC (129th check, 3rd today)
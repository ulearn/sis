Issue 1 Addendum -- Orphan Payments (25 Jul 2026, run e)

Reporter: NM | Area: Cleanup | Sheet row: 2
Last checked: 2026-07-25 UTC (101st hourly run)

Status: UNCHANGED

Orphan Payments (4 -- all unchanged)

  Payment 17187: EUR 6,151 | TransferMate Escrow | 2026-05-01 | 85 days | fideloPaymentId=37587, txn=D2026226, receiptNo=R20261478
  Payment 16988: EUR 339.90 | Bank | 2026-04-28 | 88 days | hubspotPaymentId=1204827374829
  Payment 16989: EUR 339.90 | Bank | 2026-04-28 | 88 days | hubspotPaymentId=1204846469317
  Payment 4781:  EUR 380    | Flywire | 2019-08-20 | Legacy | fideloPaymentId=32056, txn=D20191404, receiptNo=R20197498

Stale Booking Courses
  Confirmed bookings only (prior methodology): 23,173 -- unchanged
  All active BCs with past endDate: 24,447 (methodology difference)

Fix Recipe (NOT YET RUN)

Step 1 -- Payments 16988 + 16989: link to bookings
  Find booking matching 2x EUR 339.90 around Apr 28 via HubSpot payment IDs 1204827374829 and 1204846469317
  UPDATE payment SET "bookingId" = <target_id> WHERE id IN (16988, 16989);

Step 2 -- Payment 17187: investigate TransferMate
  fideloPaymentId=37587, transactionId=D2026226, receiptNumber=R20261478, comment=ULEARNP2026124
  ssh hub@localhost
  grep -r D2026226 /home/hub/web/hub.ulearnschool.com/public_html/fins/
  Once booking identified: UPDATE payment SET "bookingId" = <id> WHERE id = 17187;

Step 3 -- Payment 4781: legacy Flywire 2019
  fideloPaymentId=32056, transactionId=D20191404 -- 7-year-old Flywire payment
  Likely orphaned from migration-deleted booking
  DELETE FROM payment WHERE id = 4781;  -- confirm with Neil first

Risk: Money (payments) + Data hygiene (stale BCs). Reversible.
Status: Open -- 88 days and counting for core orphan payments.

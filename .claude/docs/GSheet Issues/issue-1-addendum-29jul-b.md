Issue 1 -- Orphan Payments (Addendum Wed 29 Jul 2026 -- 112th check)

Reporter: NM | Area: Cleanup | Sheet row: 2

STATUS: 4 orphan payments unchanged. All bookingId=null, all xeroPaymentId=null.

EVIDENCE (live DB, Wed 29 Jul 2026):

PMT 16988: amount=339.90 method=HUBSPOT type=one_time_or_initial (93 days)
PMT 16989: amount=339.90 method=HUBSPOT type=one_time_or_initial (93 days)
PMT 17187: amount=6151 method=FIDELO transactionId=D2026226 (86 days)
PMT 4781: amount=380 method=FIDELO transactionId=D20191404 (111 days, legacy)

No change since last check. Payments have not self-resolved or been linked.

FIX RECIPE (NOT YET RUN):

See base recipe: issue-1-orphan-payments.md
See prior addendum: issue-1-addendum-29jul.md

PMTs 16988+16989: Link to correct booking via SIS admin (HubSpot payments, EUR 339.90 x2)
PMT 17187: Investigate EUR 6151 TransferMate escrow payment (fidelo D2026226) - likely needs booking link
PMT 4781: Legacy Flywire EUR 380 from 2019/2020 - may be write-off

RISK: money - careful linking required; reversible

Status: OPEN - Fix NOT Run
Last checked: Wed 29 Jul 2026 UTC
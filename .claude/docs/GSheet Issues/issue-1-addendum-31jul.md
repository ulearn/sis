# Issue 1 — Orphan Payments (Addendum 31 Jul 2026, check #116)
Sheet row: 2 | Reporter: NM | Area: Cleanup

UNCHANGED from prior addenda (116th hourly check Fri 31 Jul UTC).

| ID | Amount | Method | Date | hubspotPaymentId | fideloPaymentId |
| 16988 | EUR 339.90 | Bank | 2026-04-28 | 1204827374829 | null | 94d orphaned |
| 16989 | EUR 339.90 | Bank | 2026-04-28 | 1204846469317 | null | 94d orphaned |
| 17187 | EUR 6151 | TransferMate Escrow | 2026-05-01 | null | 37587 (D2026226) | 91d orphaned |
| 4781  | EUR 380  | Flywire | 2019-08-20 | null | 32056 | legacy ~7yr |

Fix recipe (NOT YET RUN):
- Pmts 16988+16989: look up hubspotPaymentIds 1204827374829/1204846469317 to find booking; UPDATE Payment SET bookingId=<id> WHERE id IN (16988,16989)
- Pmt 17187: check HubSpot deal D2026226 (Fidelo 37587); UPDATE Payment SET bookingId=<id> WHERE id=17187
- Pmt 4781: legacy 2019; confirm with Neil whether to archive

Risk: Money — EUR 7210.80 unlinked. Reversible. Blast: 4 payments.
Status: OPEN — fix NOT RUN. Last checked: Fri 31 Jul 2026 UTC

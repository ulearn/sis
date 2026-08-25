# Issue 1 — Orphan Payments (addendum 29 Jul 2026)
Reporter: NM | Area: Cleanup | Sheet row 2

## Root Cause (live data, Wed 29 Jul 2026 UTC)
All 4 orphan payments confirmed unchanged:

| ID | Amount | Method | External ID | Days |
|----|--------|--------|-------------|------|
| 16988 | EUR 339.90 | Bank | hubspot 1204827374829 | 92 |
| 16989 | EUR 339.90 | Bank | hubspot 1204846469317 | 92 |
| 17187 | EUR 6,151 | TransferMate Escrow | fidelo 37587 | 85 |
| 4781 | EUR 380 | Flywire | fidelo 32056 | 110 |

## Fix Recipe (NOT YET RUN)
Step 1 — Link 16988+16989: check HubSpot payments 1204827374829 and 1204846469317; find deals; then UPDATE payments SET booking_id = <id> WHERE id IN (16988, 16989);
Step 2 — Investigate 17187: ssh hub@localhost, check fins/ for fidelo payment 37587.
Step 3 — Payment 4781 (Flywire, legacy): if unresolvable, add comment and write off.

## Risk: money | reversible | blast radius: 4 payments
## Status: Open — 111th check. Fix NOT RUN. Last checked: 2026-07-29 UTC
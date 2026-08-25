# Issue 1 — 35th Hourly (Wed 22 Jul 2026 UTC)
Row 2. 91st check. UNCHANGED.

4 orphan payments (bookingId=null):
Pmt 16988: EUR 339.90, Bank, 28 Apr 2026, 85 days
Pmt 16989: EUR 339.90, Bank, 28 Apr 2026, 85 days
Pmt 17187: EUR 6151, TransferMate Escrow, 1 May 2026, 82 days
Pmt 4781: EUR 380, Flywire, legacy, 103+ days

Stale BCs: 24,436 (active=true, end before 22 Jul 2026)
Stale BAs: 11,175

## Fix (NOT YET RUN)
1. Link each orphan payment to its booking (manual investigation)
2. Run deactivation script for stale BCs and BAs
See: issue-1-orphan-payments.md

Status: OPEN. Last checked: Wed 22 Jul 2026 (35th hrly, 91st check).
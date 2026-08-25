Issue 1 Addendum 22 Jul 2026 (e)
38th hourly check Wed 22 Jul 2026 UTC (94th total). UNCHANGED.

Orphan payments (bookingId=null):
- 16988: EUR 339.90, Bank, Apr 28 2026 (HUBSPOT) - 86 days, xeroId null
- 16989: EUR 339.90, Bank, Apr 28 2026 (HUBSPOT) - 86 days, xeroId null
- 17187: EUR 6151, TransferMate, May 1 2026 (FIDELO, txn D2026226) - 79 days, xeroId null
- 4781: EUR 380, Flywire, Aug 2019 (FIDELO, txn D20191404) - 103 days since DB creation, xeroId null
Stale BCs: 24,436 (active=true, endDate < Jul 22)
Stale BAs: 11,175 (active=true, endDate < Jul 22)

Fix recipe (NOT YET RUN):
See issue-1-orphan-payments.md and issue-1-addendum-22jul-d.md for full steps.
1. Link 16988/16989/17187 to their bookings (check HubSpot deals)
2. Evaluate 4781 (2019 legacy - possibly safe to void)
3. Run deactivation job for stale BCs and BAs

Risk: money + data-hygiene, reversible, ~EUR 6811 in unlinked payments
Last checked: Wed 22 Jul 2026 UTC
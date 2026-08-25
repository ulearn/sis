ISSUE 36b — Pietro Caccianiga: Xero Reconciliation

Reporter: KC | Sheet row: 38 | Check: 159th Tue 11 Aug 2026 UTC

Current state:
• Booking 17980 (Pietro): CONFIRMED, EUR 5331 paid, EUR 0 open
• BC 24772 (General English AM): ends 2026-08-21 (10d), classAssignments=2 ok
• Payment 17733: EUR 5331, bookingId=17980, xeroId=null (~70d pending)
• CORRECTION: Payment 17519 (EUR 321.35) is bookingId=17850, NOT 17980. Prior reports wrong.

Fix (NOT YET RUN):
1. Reconcile payment 17733 in Xero against booking 17980 invoice.
2. Update: UPDATE payments SET xero_id=[XERO_ID], updated_at=NOW() WHERE id=17733;
3. Ignore payment 17519 — belongs to booking 17850.

Risk: money. Reversible: yes. Blast: single payment.
Status: class assignment resolved. Xero pending. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (159th check)
Issue 1 - Orphan Payments - 135th check Mon 3 Aug 2026 UTC (4th today)

Root Cause (confirmed 2026-08-03, 135th check):
- Payment 16988: EUR 339.90, booking_id=null, xero=null. Matches Galbusera booking 17856.
- Payment 16989: EUR 339.90, booking_id=null, xero=null. Matches Fassina booking 17857.
- Payment 17187: EUR 6151, txn=D2026226, booking_id=null. 100 days orphaned.
- Payment 4781: EUR 380, txn=D20191404, booking_id=null. Legacy 2019 (~7 years).
- BC24630+24631 (ended Jul10): active=true, 25 days stale. Also Issue 48.
- Bk17856+17857: CONFIRMED, confirmed=false, 0 payments linked.

Fix Recipe - NOT YET RUN
Step 1: UPDATE payments SET booking_id=17856 WHERE id=16988;
        UPDATE payments SET booking_id=17857 WHERE id=16989;
Step 2: UPDATE booking_courses SET active=false WHERE id IN (24630,24631); coord with Issue 48
Step 3: Review pmt17187 (EUR 6151, txn D2026226). Find and link matching booking.
Step 4: Pmt4781 (EUR 380, 2019). Confirm with Neil before actioning.

Risk: Money and data hygiene. Reversible.
Status: UNCHANGED. 4 orphan pmts, 100 days. Fix NOT RUN.
Last checked: 2026-08-03 UTC (135th hourly check, 4th today)
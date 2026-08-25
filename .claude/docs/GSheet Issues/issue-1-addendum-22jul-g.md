Issue 1 - Orphan Payments + Stale Records
Reporter: NM | Area: Cleanup | Sheet row: 2 | Last checked: 2026-07-22 UTC

Symptom: 4 payments with booking_id=null; 24,436 stale booking courses; 11,175 stale booking accommodations.

Root Cause:
- Payment 16988 (EUR 339.90, Bank): payment_date 28 Apr 2026. booking_id=null. 86 days since creation.
- Payment 16989 (EUR 339.90, Bank): payment_date 28 Apr 2026. booking_id=null. 86 days since creation.
- Payment 17187 (EUR 6151, TransferMate Escrow): payment_date 1 May 2026, created 5 May 2026. booking_id=null. 79 days.
- Payment 4781 (EUR 380, Flywire): CORRECTION — payment_date 2019-08-20 (7-year-old FIDELO migration). Permanently unresolvable.
- Stale booking courses: 24,436 — unchanged.
- Stale booking accommodations: 11,175 — unchanged.
- Fresh DB confirmed — 40th hourly check Wed 22 Jul 2026 UTC (96th total).

Fix Recipe (NOT YET RUN):
Step 1: Payments 16988/16989/17187 — search HubSpot Commerce by student/amount/date. Link booking_id via SIS. Reconcile in Xero.
Step 2: Payment 4781 — do NOT link/delete. Legacy 2019 FIDELO record.
Step 3: Stale deactivation — UPDATE booking_courses SET active=false WHERE active=true AND end_date < NOW(); (batch 1000).

Risk: Deactivation reversible; payment linking is not. Blast radius ~35k records + EUR 6831 orphan payments.
Status: Open - fix NOT RUN. Wed 22 Jul 2026 UTC (40th hourly, 96th total).
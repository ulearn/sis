Issue 1 - Orphan Payments + Stale Records (CORRECTION on Payment 4781)
Reporter: NM | Area: Cleanup | Sheet row: 2 | Last checked: 2026-07-22 UTC

Symptom: 4 payments with booking_id=null; 24,436 stale booking courses; 11,175 stale booking accommodations.

Root Cause (with correction on payment 4781):
- Payment 16988 (EUR 339.90, Bank, HubSpot source, type=one_time_or_initial): payment_date 28 Apr 2026,
  created_at 28 Apr 2026. booking_id=null. xero_payment_id=null.
- Payment 16989 (EUR 339.90, Bank, HubSpot source, type=one_time_or_initial): payment_date 28 Apr 2026,
  created_at 28 Apr 2026. booking_id=null. xero_payment_id=null.
- Payment 17187 (EUR 6151, TransferMate Escrow, FIDELO source): payment_date 1 May 2026,
  created_at 5 May 2026. booking_id=null. xero_payment_id=null.
- Payment 4781 (EUR 380, Flywire, FIDELO source): CORRECTION from all previous checks.
  payment_date=2019-08-20 (a 7-year-old payment migrated from FIDELO in Apr 2026).
  created_at=2026-04-10. Previous checks reported this as Apr 2026 - that was created_at, not payment_date.
  Almost certainly permanently unresolvable: no 2019 booking in SIS to link to.
- Stale booking courses (active=true, end_date < now): 24,436 - unchanged.
- Stale booking accommodations (active=true, end_date < now): 11,175 - unchanged.

Fix Recipe (NOT YET RUN):
Step 1 - Payments 16988, 16989, 17187:
  Search HubSpot Commerce for matching deals by student/amount/date. Link booking_id via SIS admin.
  Reconcile each in Xero.
Step 2 - Payment 4781:
  Do NOT link or delete. Legacy 2019 FIDELO migration record.
  Add comment noting its origin. Check if any pre-SIS record matches.
Step 3 - Stale deactivation:
  UPDATE booking_courses SET active=false WHERE active=true AND end_date < NOW();
  UPDATE booking_accommodations SET active=false WHERE active=true AND end_date < NOW();
  Batch 1000 at a time during off-peak hours.

Risk: Deactivation reversible; payment linking is not. Blast radius ~35k records + EUR 6831 orphan payments.
Status: Open - fix NOT RUN. Wed 22 Jul 2026 UTC (39th hourly, 95th total check).
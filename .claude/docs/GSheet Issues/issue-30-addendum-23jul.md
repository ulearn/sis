Issue 30 - Giulia Avallone - Stale BC + Xero Payment Null - Addendum 23 Jul 2026

Sheet row: 31 | Check: 39th hourly (Thu 23 Jul 2026 UTC)

Status: UNCHANGED

Evidence (fresh DB, 23 Jul 2026 UTC):
- BC 104 (Morning General Plus, ended 26 Jun 2026): active = true - 27 days stale
- Payment 17102: EUR 1151.50, booking 94 (Giulia Avallone, student 88)
  xeroPaymentId = null, type = null, created 5 May 2026
  Unreconciled in Xero - 79 days outstanding

Fix Recipe (NOT YET RUN):

Step 1 - Deactivate BC 104:
  UPDATE "BookingCourse" SET active = false
  WHERE id = 104 AND "endDate" < NOW();

Step 2 - Reconcile in Xero: find invoice for booking 94, match EUR 1151.50 (~5 May 2026).
After Xero reconciliation, update SIS:
  UPDATE "Payment"
  SET "xeroPaymentId" = '<xero_id>', type = 'Bank'
  WHERE id = 17102;

Risk: Low. BC deactivation cosmetic/reversible. Xero step for accounts team.

Last checked: Thu 23 Jul 2026 UTC
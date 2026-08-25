Issue 17 - Ana Jessica Rosa de Paula Santos - 30 Jul 2026 UTC (14th check)
--------------------------------------------------------------------------
Root cause (unchanged):
- Booking 1308: CANCELLED, confirmed=false -- 53 days since cancellation (7 Jun 2026).
- Amount paid EUR 1,530 / 1,530 (fully paid despite CANCELLED -- anomaly).
- Payment 17186 (EUR 1,280): Bank Transfer, 1 May 2026, xeroPaymentId=null -- 90 days without Xero link.
- Payment 17050 (EUR 250): Bank Transfer, 17 Feb 2026, xeroPaymentId=null -- 163 days without Xero link.
- Booking course 1350 (Academic Year Afternoon): active=true, end 13 Nov 2026 -- orphaned.

Fix recipe (NOT YET RUN):
Option A - Reinstate:
  UPDATE booking SET status = CONFIRMED, confirmed = true WHERE id = 1308;
  Then link PMT17186+PMT17050 in Xero; deactivate BC 1350 when course ends.
Option B - Reconcile cancelled:
  1. Confirm deal closed in HubSpot.
  2. Create Xero credit note; apply both payments.
  3. UPDATE booking_course SET active = false WHERE id = 1350;

Risk: money -- EUR 1,530; needs accounts decision first. BC deactivation reversible.
Status: OPEN - unchanged since 28 Jul 2026. Last checked: Thu 30 Jul 2026 UTC

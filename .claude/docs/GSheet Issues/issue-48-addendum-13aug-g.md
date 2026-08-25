# Issue 48 — Telmuun Enkhsaikhan / BC 1810 — Addendum 13 Aug 2026 (g)

Sheet row 50 | Check 113th | 249th global run ~18:xx UTC

No change since 112th check (17:03 UTC today).

- BC 1810 (Academic Year Renewal Morning, Telmuun Enkhsaikhan): startDate=2026-06-29, endDate=2027-01-01, active=true, bookingId=1624, 0 class assignments — 46 days since course start
- Booking 1624: PARTIAL, confirmed=false, amountPaid=EUR 1,406, amountOpen=EUR 250; updatedAt=2026-08-05
- Payment 17956: EUR 100, paymentDate=2026-03-31, dataSource=HUBSPOT, xeroPaymentId=null — 135 days unreconciled

Fix (NOT YET RUN):
  1. Assign BC 1810 to AM class via SIS UI (week_end=2027-01-01)
  2. Reconcile Payment 17956 in Xero: ssh hub@localhost → fins/
  3. After final EUR 250 paid: UPDATE Booking SET confirmed=true WHERE id=1624;

Status: Open. BC 1810 0 SCAs (46d). Booking 1624 PARTIAL EUR 250 open. Payment 17956 Xero null (135d). Fix NOT RUN.
Last checked: 2026-08-13 ~18:xx UTC

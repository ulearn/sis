Issue 1 — Orphan Payments (133rd check, 2nd on Aug 3)
Sheet row: 2

Status: Mon 3 Aug 2026 UTC, 2nd check. 4 orphans unchanged (99 days).

Fresh DB confirms:
- Payment 16988: EUR 339.90, one_time_or_initial, paymentDate=2026-04-28, xeroPaymentId=null, bookingId=null.
- Payment 16989: EUR 339.90, one_time_or_initial, paymentDate=2026-04-28, xeroPaymentId=null, bookingId=null.
- Payment 17187: EUR 6,151, transactionId=D2026226, paymentDate=2026-05-01, bookingId=null. (99d)
- Payment 4781: EUR 380, transactionId=D20191404, paymentDate=2019-08-20. (legacy ~7yr)
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amountPaid=EUR 339.90, 0 payments linked.
  BC 24631 (General English AM Plus, Jun29-Jul10): active=true — 24d stale.
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false, amountPaid=EUR 339.90, 0 payments linked.
  BC 24630 (General English AM Plus, Jun29-Jul10): active=true — 24d stale.
- Pmts 16988+16989 (EUR 339.90 each) match bk17856+17857 amounts — likely belong to these bookings.
- Unchanged from 1st-today (issue-1-addendum-3aug.md).

Fix recipe (NOT YET RUN) — full steps in issue-1-addendum-3aug.md:
1. Verify HubSpot: pmt 16988 (ID 1204827374829) -> Galbusera bk17856; pmt 16989 (ID 1204846469317) -> Fassina bk17857.
2. UPDATE payments SET booking_id=17856 WHERE id=16988;
3. UPDATE payments SET booking_id=17857 WHERE id=16989;
4. UPDATE booking_courses SET active=false WHERE id IN (24630, 24631);
5. Payment 17187 (EUR 6,151, D2026226): identify booking separately.
6. Payment 4781 (EUR 380, 2019): legacy, low priority, manual review.

Risk: payments + bookings — reversible — 2 students.
Status: NOT RUN — 133rd check, 2nd Mon 3 Aug 2026 UTC.
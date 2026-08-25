Issue 48 Galbusera + Fassina confirmed=false + orphan payments
Reporter: AC Row 50 Check 29th (4th today Sun 2 Aug UTC)

Root Cause (29th check 02 Aug 2026):
- BK 17856 (Galbusera): CONFIRMED confirmed=false amountPaid=EUR 339.90 amountOpen=null 0 payment records linked.
- BK 17857 (Fassina): CONFIRMED confirmed=false amountPaid=EUR 339.90 amountOpen=null 0 payment records linked.
- Payment 16988: EUR 339.90 Bank bookingId=null hubspotPaymentId=1204827374829 xeroPaymentId=null.
- Payment 16989: EUR 339.90 Bank bookingId=null hubspotPaymentId=1204846469317 xeroPaymentId=null.
- BC 24630 (bk 17857 Jun 29-Jul 10 2026): active=true 23 days stale.
- BC 24631 (bk 17856 Jun 29-Jul 10 2026): active=true 23 days stale.

Fix Recipe (NOT YET RUN):
1. Verify HubSpot IDs: check which deal (Galbusera vs Fassina) matches HS payment IDs 1204827374829 + 1204846469317.
2. Link payments: UPDATE payments SET booking_id=17856 WHERE id=<pmt_for_galbusera>; UPDATE payments SET booking_id=17857 WHERE id=<pmt_for_fassina>;
3. Set confirmed=true: UPDATE bookings SET confirmed=true WHERE id IN (17856,17857);
4. Fix amountOpen (null): SELECT amount_total, amount_paid FROM bookings WHERE id IN (17856,17857); then UPDATE bookings SET amount_open=amount_total-amount_paid WHERE id IN (17856,17857);
5. Deactivate stale BCs: UPDATE booking_courses SET active=false WHERE id IN (24630,24631);

Risk: Payments + bookings. Reversible. 2 students. Verify HubSpot IDs first.

Status: UNRESOLVED Fix NOT RUN
Last checked: 2026-08-02 UTC
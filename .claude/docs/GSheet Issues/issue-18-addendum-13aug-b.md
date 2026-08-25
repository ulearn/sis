# Issue 18 — Flávia Nascimento Mariano — Addendum 13 Aug 2026 (b)

Sheet row 19 | Check 20th | 249th global run ~18:xx UTC

No change since 19th check (17:03 UTC today). Booking updated 10 Aug (not visa-related).

- Student 983: visaStatus=null, visaId=null; visaFrom=2026-06-01, visaUntil=2027-02-01 (dates present, status unset); updatedAt=2026-07-28
- Booking 1534: CONFIRMED, confirmed=true, amountPaid=EUR 1,308, amountOpen=EUR 0, serviceEnd=2026-11-27; updatedAt=2026-08-10
- Payment 17035: EUR 250, 2026-02-17, dataSource=FIDELO, xeroPaymentId=null — 177 days unreconciled
- Payment 17527: EUR 1,058, 2026-05-19, dataSource=HUBSPOT, xeroPaymentId=null — 86 days unreconciled
- Day 73 since course start (1 Jun → 13 Aug 2026)

Fix (NOT YET RUN):
  UPDATE Student SET visa_status='approved' WHERE id=983;
  Xero: reconcile payments 17035 and 17527 for booking 1534 via hub

Status: Open. Visa null day 73. Pmts 17035 (177d) + 17527 (86d) Xero unreconciled. Fix NOT RUN.
Last checked: 2026-08-13 ~18:xx UTC

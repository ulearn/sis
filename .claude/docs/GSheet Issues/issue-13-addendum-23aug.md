Issue 13 addendum 470th check Sun 23 Aug 2026
Libeth del Carmen Sierra Martinez -- insurance null, day 83

Root cause:
- Student 14522: visaStatus null; last updated 2026-08-19 (4 days ago, no change).
- Booking 17981: CONFIRMED, confirmed=false (anomaly); amountPaid=EUR 1,407.50; amountOpen=null.
- Payment 17520: EUR 1,407.50, 22 May 2026, xeroPaymentId=null.
- Document 213 (LOA): ISSUED 10 Jun 2026. No insurance document found.
- Day 83 without insurance. Data unchanged since 61st check (Fri 21 Aug).

Fix NOT YET RUN:
1. Set confirmed=true on booking 17981.
2. Set visaStatus on student 14522 (check HubSpot deal for approval).
3. Reconcile payment 17520 with Xero (EUR 1,407.50, 22 May 2026).
4. Generate and issue insurance document via SIS admin Booking 17981 -> Documents.

Risk: documents/data-hygiene -- reversible. Blast radius: 1 student, 1 booking, 1 payment.
Status: Open -- day 83 without insurance. Fix NOT RUN.
Last checked: 2026-08-23 UTC (470th run)

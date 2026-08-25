Issue 13 Lizbeth del Carmen (59th check, 19 Aug 2026)
Sheet row: 14  Reporter: NM/ST  Area: Booking

Symptom
Health insurance not on invoice; visaStatus not set.

Status: No change since 58th check (Tue 18 Aug).

Evidence (live DB, 19 Aug 2026)
- Student 14522: visaStatus = null (unchanged), visaId = null
- Booking 17981: CONFIRMED, confirmed = false -- anomaly
- Payment 17520: EUR 1,407.50, paymentDate 22 May 2026, xeroPaymentId = null -- 89 days unreconciled
- Documents 211 (REVOKED) + 213 (ISSUED) -- both template 1 (LOA); no insurance document on record
- Day 79 in course (started 1 Jun 2026)

Fix Recipe -- NOT YET RUN
1. Set confirmed = true on booking 17981:
   UPDATE bookings SET confirmed = true WHERE id = 17981;
2. Reconcile Payment 17520 in Xero
3. Arrange insurance if required (liaise with agency WORLD2GO)

Risk: Low. Data-hygiene + Xero reconciliation.
Status: Fix NOT RUN. Last checked: Wed 19 Aug 2026 UTC (59th check).
# Issue 13 — Lizbeth del Carmen Sierra Martinez — Insurance Null — 472nd check

Reporter: TB | Area: Booking / Doc Gen | Sheet row 14

## Symptom
Health insurance document not generated; visa_status null; booking not marked confirmed despite full payment.

## Root cause (confirmed Tue 25 Aug 2026 UTC)
- Student 14522 (Lizbeth del Carmen Sierra Martinez): visa_status = null
- Booking 17981: CONFIRMED, confirmed = false (anomaly); amount paid = EUR 1,407.50 = amount total (fully paid)
- Payment 17520: EUR 1,407.50, Bank, 22 May 2026 — xeroPaymentId = null (unreconciled)
- Documents: doc 213 (template 1, Invoice) ISSUED | doc 211 REVOKED — no insurance document generated
- Day 85 without insurance. Unchanged from 471st check (Mon 24 Aug).

## Fix recipe (NOT YET RUN)
Step 1: UPDATE bookings SET confirmed = true WHERE id = 17981;
Step 2: Verify visa in HubSpot, then: UPDATE students SET visa_status = 'Approved' WHERE id = 14522;
Step 3: Generate insurance document via SIS admin — Booking 17981 — Documents.
Step 4: Reconcile payment 17520 (EUR 1,407.50) in Xero.

## Risk
Documents / data-hygiene. Reversible. Blast radius: 1 student, 1 booking.

## Status
OPEN — Day 85 without insurance. confirmed = false despite full payment. Fix NOT RUN.
Last checked: 2026-08-25 UTC (517th run, 472nd issue check)
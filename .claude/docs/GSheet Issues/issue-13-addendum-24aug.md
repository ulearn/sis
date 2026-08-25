# Issue 13 — Lizbeth del Carmen Sierra Martinez — Insurance Null — 471st check

Reporter: TB | Area: Doc Gen / Certs | Sheet row 14

## Root cause (confirmed Mon 24 Aug 2026 UTC)
- Student 14522 (Lizbeth): visa_status = null, last updated 2026-08-19
- Booking 17981: CONFIRMED, confirmed = false (anomaly); amount paid = EUR 1,407.50 = amount total (fully paid)
- Payment 17520: EUR 1,407.50, xero_payment_id = null
- Booking Course 24773 (Academic Year Afternoon): ends 2027-01-29, active = true
- Documents: doc 213 (template 1, Invoice): ISSUED | doc 211: REVOKED — no insurance document
- Day 84 without insurance. Unchanged from 470th check (Sun 23 Aug).

## Fix recipe (NOT YET RUN)
Step 1: UPDATE bookings SET confirmed = true WHERE id = 17981;
Step 2: Check HubSpot deal then: UPDATE students SET visa_status = 'Approved' WHERE id = 14522;
Step 3: Generate insurance doc via SIS admin Booking 17981 -> Documents.
Step 4: Reconcile payment 17520 (EUR 1,407.50) in Xero.

## Risk
Documents / data-hygiene. Reversible. Blast radius: 1 student, 1 booking.

## Status
OPEN — Day 84 without insurance. confirmed = false despite full payment. Fix NOT RUN.
Last checked: 2026-08-24 UTC (495th run, 471st issue check)

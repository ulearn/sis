# Issue 36b — Pietro Caccianiga — Accommodation Fee + Xero (170th check 12 Aug 2026)

Reporter: AC  Area: Booking / Accomm  Sheet row: 38

Symptom: Accommodation dates error. Booking Accommodation fee unset; payment unreconciled in Xero.

Root Cause (170th check):
- Booking Accommodation 11393: bed 88 (Bed A), active = true, start 22 Aug 2026, end 13 Sep 2026 — fee = null (73 days unset)
- Accommodation starts in 10 days — fee must be set before student arrives
- Booking Course 24772 (General English AM, student 14521 Pietro Caccianiga): ends 21 Aug 2026, active = true — 2 class assignments confirmed (student IS correctly assigned to a class)
- Payment 17733: EUR 5,331, xeroPaymentId = null, created 2 Jun 2026 (73 days unreconciled), on booking 17980

Fix Recipe — NOT YET RUN:

Step 1 — Set Booking Accommodation 11393 fee:
Confirm agreed weekly rate with Diego/accounts, then:
UPDATE booking_accommodations SET fee = <amount> WHERE id = 11393;

Step 2 — Reconcile Payment 17733 in Xero:
Log into Xero -> locate payment receipt for EUR 5,331 dated 2 Jun 2026 -> match to Pietro invoice.

Risk / Category:
- Category: money / bookings. Reversible. Blast radius: 1 student, 1 payment, 1 booking accommodation.
- Time pressure: accommodation starts 22 Aug (10 days) — fee should be set before arrival.

Status: Fix NOT RUN. 170 consecutive checks.
Last checked: Wed 12 Aug 2026 UTC (170th check)
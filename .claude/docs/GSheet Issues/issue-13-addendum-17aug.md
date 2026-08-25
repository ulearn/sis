# Issue 13 — Lizbeth del Carmen (57th check, 17 Aug 2026 UTC)
Reporter: AC | Area: Visa/Booking | Sheet row: 14

## Symptom
Insurance null; booking confirmed = false despite payment received.

## Root cause (evidence)
- Student 14522 (Lizbeth del Carmen Sierra Martinez)
- Day 77 in course (start: Jun 1 2026)
- visaId = null; visaFrom = 2026-06-01, visaUntil = 2027-02-01 (no ID number)
- insuranceFrom = null, insuranceUntil = null
- Booking 17981: CONFIRMED, confirmed = false, amountPaid = EUR 1,407.50, amountOpen = null
- Payment 17520: EUR 1,407.50, Bank, 2026-05-22, xeroPaymentId = null (87d unreconciled)

## Fix recipe (NOT YET RUN)

Step 1 — Set confirmed = true on Booking 17981:
  UPDATE Booking SET confirmed = true, updatedAt = NOW() WHERE id = 17981;

Step 2 — Add insurance dates (confirm with agent/student first):
  UPDATE Student SET insuranceFrom = START, insuranceUntil = END, updatedAt = NOW() WHERE id = 14522;

Step 3 — Reconcile Payment 17520 in Xero (manual).

Step 4 — Add visaId if available:
  UPDATE Student SET visaId = VISA_ID, updatedAt = NOW() WHERE id = 14522;

## Risk / Category
Documents + bookings | Reversible | Blast radius: 1 student

## Status
OPEN — fix NOT RUN. Day 77. Insurance null. confirmed = false. Payment 17520 Xero null 87d.
Last checked: 2026-08-17 UTC (57th check)
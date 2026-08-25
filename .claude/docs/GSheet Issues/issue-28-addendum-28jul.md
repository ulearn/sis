# Issue 28 — Paola Moreira (BK17850 confirmed=false) | Addendum 28 Jul 2026

Reporter: AC | Area: Booking | Sheet row: 29

## Symptom
Appears in class but cannot be assigned — says payment not received.

## Root Cause
Booking 17850 has status=CONFIRMED but confirmed=false (anomaly).
amountPaid=null (not set to 0), amountOpen=EUR321.35.

Evidence (28 Jul 2026 UTC):
- Booking 17850: status=CONFIRMED, confirmed=false, amountOpen=EUR321.35, amountPaid=null
- Last updated 8 Jul 2026 — 20 days stale
- Low priority: student appears in class (issue is assignment block only)

## Fix Recipe (NOT YET RUN)
Step 1 — Verify payment status in HubSpot/Xero before changing

Step 2 — If payment confirmed externally:
UPDATE Booking SET confirmed = true, "amountPaid" = 0 WHERE id = 17850;
(Adjust amountPaid to actual amount if different from 0)

## Risk
Category: bookings / low-priority. Reversible. Verify payment externally first.

## Status
Unchanged — CONFIRMED confirmed=false, amountPaid=null (20d). Fix NOT RUN.
Last checked: 28 Jul 2026 UTC
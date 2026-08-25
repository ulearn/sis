# Issue 18 — Flávia Nascimento Mariano — Visa Status Null + Xero Unreconciled
Reporter: ST | Area: Visa | Sheet row 19 | 16th hourly check Tue 11 Aug 2026 UTC

## Symptom
Student shows as visa pending. Changing dropdown to approved throws PrismaClientKnownRequestError.

## Root cause (live data, 11 Aug 2026)
- Student 983: visaStatus = null, visaId = null; visa dates 1 Jun 2026 – 1 Feb 2027
- Booking 1534: CONFIRMED, confirmed = true, EUR 1,308 paid, EUR 0 open
  - Service end updated 10 Aug 2026: Nov 20 -> Nov 27 2026 (aligns with BC 1710, no anomaly)
- Payment 17035: EUR 250, payment_date 17 Feb 2026 — xero_payment_id = null (175 days unreconciled)
- Payment 17527: EUR 1,058, payment_date 19 May 2026 — xero_payment_id = null (84 days unreconciled)
- BC 1710 (Academic Year Afternoon, 1 Jun – 27 Nov 2026): active, 2 SCAs — student IS in class
- Day 71 in course. Root cause: visaStatus = null blocks UI approval dropdown.

## Fix recipe — NOT YET RUN

Step 1 — Set visa status via SIS admin (student 983) or:
  SELECT DISTINCT visa_status FROM students WHERE visa_status IS NOT NULL LIMIT 5;  -- check enum
  UPDATE students SET visa_status = 'approved' WHERE id = 983;

Step 2 — Reconcile payments in Xero:
  Payment 17035 (EUR 250): find in Xero, reconcile, write xero_payment_id back to SIS.
  Payment 17527 (EUR 1,058): same. Total EUR 1,308 = amountPaid (fully paid, not yet reconciled).

Step 3 — Verify student 983 no longer shows as visa pending in SIS UI.

## Risk
Category: bookings + financial | Reversible: yes | Blast radius: single student

## Status
Visa null unchanged. Xero gap growing (175d + 84d). Service end corrected 10 Aug. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC
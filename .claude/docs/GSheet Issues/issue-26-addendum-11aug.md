# Issue 26 — Ivan Rodriguez — Addendum 11 Aug 2026

**Sheet row:** 27 | **Reporter:** PG | **Area:** Booking / Class | **Check:** 61st hourly Tue 11 Aug 2026 UTC

Symptom: Intensive students only appear once in to-be-assigned list.

Root Cause (unchanged): Two stale BCs + outstanding EUR 250 balance + three Xero-unreconciled payments.

Current State (11 Aug 2026):

Stale Booking Courses:
- BC 23 (Intensive General 30, booking 22): endDate = 2026-05-22, active = true — 81 days stale
- BC 24826 (2 weeks Intensive 08/06-19/06/2026, booking 18034): endDate = 2026-06-19, active = true — 53 days stale

Open Balance:
- Booking 18034: status = PARTIAL, amountOpen = EUR 250, amountPaid = EUR 845

Xero-Unreconciled Payments:
- Payment 17023: EUR 1,698, booking 22, paymentDate 14 Feb 2026, transactionId D2025452, xeroPaymentId = null
- Payment 17237: EUR 250, booking 22, paymentDate 1 Oct 2025, transactionId D2025452, xeroPaymentId = null
- Payment 17683: EUR 845, booking 18034, paymentDate 23 Apr 2026, xeroPaymentId = null

No change from previous check.

Fix Recipe (NOT YET RUN):

Step 1 — Deactivate stale BCs:
  UPDATE "BookingCourse" SET active = false WHERE id IN (23, 24826);

Step 2 — Chase EUR 250 balance on booking 18034 (verify paid or adjust amount).

Step 3 — Reconcile pmts 17023, 17237, 17683 in Xero via Hub fins/ and update xeroPaymentId.

Risk: data-hygiene + money | reversible: yes | blast radius: 2 BCs + 3 payments + 1 open balance | urgency: medium

Status: Open — fix NOT RUN. Day 81 (BC 23).
Last checked: Tue 11 Aug 2026 UTC
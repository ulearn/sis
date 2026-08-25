# Issue 30 — Giulia Avallone / Milena Vinci — Addendum 11 Aug 2026

**Sheet row:** 31 | **Reporter:** AC | **Area:** Booking | **Check:** 124th hourly Tue 11 Aug 2026 UTC

Symptom: Parent (Milena Vinci) listed as student in SIS. Stale BC + unreconciled payments.

Root Cause (unchanged): BC 104 (Morning General Plus, 15-26 Jun 2026) 46d stale. Two payments long unreconciled in Xero.

Current State (11 Aug 2026):

Stale Booking Course:
- BC 104 (Morning General Plus): endDate = 2026-06-26, active = true — 46 days stale (was 45d Mon 10 Aug)

Xero-Unreconciled Payments:
- Payment 17102: EUR 1,151.50, booking 94, paymentDate 13 Mar 2026, xeroPaymentId = null — 151 days
- Payment 945: EUR 4,231, booking 79, paymentDate 30 Jan 2026, xeroPaymentId = null — 193 days

No change from previous check.

Fix Recipe (NOT YET RUN):

Step 1 — Verify no SCAs on BC 104, then deactivate:
  SELECT COUNT(*) FROM "StudentClassAssignment" WHERE "bookingCourseId" = 104;
  UPDATE "BookingCourse" SET active = false WHERE id = 104;

Step 2 — Reconcile pmts 17102 (EUR 1,151.50, booking 94) and 945 (EUR 4,231, booking 79) in Xero via Hub fins/.

Risk: data-hygiene + money | reversible: yes | blast radius: 1 BC + 2 payments | urgency: medium-high (193d Xero lag)

Status: Open — fix NOT RUN. BC 104: 46d stale; payments: 151d + 193d Xero null.
Last checked: Tue 11 Aug 2026 UTC
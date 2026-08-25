# Issue 19 — Maï Lan Chu / Stale BCs 89+90 + Payment Discrepancy EUR 2,385

**Reporter:** AC | **Area:** Booking / Class | **Sheet row:** 20 | **Check:** 14th (Sun 16 Aug 2026 UTC)

## Symptom
Student not appearing in class-to-be-assigned list.

## Root cause
BCs 89 and 90 active 86 days past end (2026-05-22).

NEW (16 Aug): 3 payments on Booking 83, all xeroPaymentId=null. Their total (EUR 5014.80) exceeds amountPaid (EUR 2629.80) by EUR 2385.

Payments:
- Payment 27: EUR 2135, Xero null
- Payment 17002: EUR 2629.80, Xero null
- Payment 17019: EUR 250, Xero null
- Total: EUR 5014.80 vs amountPaid EUR 2629.80 — discrepancy EUR 2385

Possible causes: Payment 27 is a pre-migration Fidelo deposit superseded by 17002, or a refund not shown.

SCA 250 on BC 89: class 10, 13 Apr–22 May 2026 — historical/within period, safe to deactivate.
BC 90: 0 SCAs.

## Fix recipe (NOT YET RUN)

Step 1 — Confirm SCA 250 is historical:
SELECT sca.week_end, bc.end_date FROM student_class_assignments sca JOIN booking_courses bc ON sca.booking_course_id=bc.id WHERE sca.id=250;

Step 2 — Deactivate BCs:
UPDATE booking_courses SET active=false WHERE id IN (89,90);

Step 3 — Investigate discrepancy:
SELECT id,amount,method,xero_payment_id,created_at FROM payments WHERE booking_id=83 ORDER BY created_at;
Check if Payment 27 (EUR 2135) is a pre-migration deposit superseded by Payment 17002 (EUR 2629.80).
Reconcile all 3 in Xero after understanding the gap.

## Risk
data-hygiene / money — reversible — 1 booking, Xero reconciliation

## Status
Open — Fix NOT RUN. Payment discrepancy EUR 2385 is a new finding requiring investigation.

**Last checked:** Sun 16 Aug 2026 UTC (14th check)
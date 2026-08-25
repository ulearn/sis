# Issue 48 — Telmuun Enkhsaikhan — BC 1810 0 class assignments (114th check Thu 13 Aug 2026 UTC)

No data change since 113th check.

## Evidence
- BC 1810: active=true, startDate=2026-06-29, endDate=2027-01-01, classAssignments=0 (45 days since start)
- BK 1624: PARTIAL, confirmed=false, amountPaid=1406, amountOpen=250, updatedAt=2026-08-05
- Payment 17956: EUR 100, HubSpot, paymentDate=2026-03-31, xeroPaymentId=null (135 days)
- SCAs for BC 1810: none

## Fix (NOT YET RUN)
Determine correct AM class ID via admin UI. Then:
INSERT INTO student_class_assignment (booking_course_id, class_id, week_start, week_end, created_at, updated_at)
VALUES (1810, :class_id, '2026-06-29', '2027-01-01', NOW(), NOW());
UPDATE booking SET confirmed = true WHERE id = 1624; -- only after EUR 250 received
Reconcile Payment 17956 in Xero via Hub fins/ tools.

Risk: Bookings/Attendance/Money, reversible, 1 BC 1 booking 1 payment
Last checked: Thu 13 Aug 2026 UTC (114th check)
Issue 30 check 127 Fri 14 Aug 2026

BC 104 (Morning General Plus, bk 94): active ended 2026-06-26, 49d stale (1 historical SCA 270, weekStart Jun15, weekEnd Jun26)
bk94: CONFIRMED confirmed=true, fully paid EUR 1151.50
Payment 17102: EUR 1151.50, xeroPaymentId=null - 154d without Xero (paid 2026-03-13)
Payment 945: xeroPaymentId=null - 196d without Xero

Fix (NOT YET RUN):
  Confirm SCA 270 historical: SELECT * FROM student_class_assignment WHERE booking_course_id = 104;
  UPDATE booking_course SET active = false WHERE id = 104;
  Reconcile payments 17102 + 945 in Xero.

Risk: money (Xero lag) + data-hygiene; reversible.
Status: Unchanged. Fix NOT RUN. Last checked 2026-08-14 UTC, 127th check.

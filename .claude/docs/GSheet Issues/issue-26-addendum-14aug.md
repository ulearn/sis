Issue 26 check 64 Fri 14 Aug 2026

BC 23 (Intensive General 30, bk 22): active ended 2026-05-22, 84d stale (2 historical SCAs: 122+376)
BC 24826 (Intensive 2 weeks, bk 18034): active ended 2026-06-19, 56d stale (0 SCAs)
bk18034: PARTIAL confirmed=false, EUR 845 paid of EUR 1095 - EUR 250 outstanding
Payment 17683: EUR 845, xeroPaymentId=null (created 2026-06-01)

Fix (NOT YET RUN):
  Verify SCAs 122+376 historical: SELECT * FROM student_class_assignment WHERE booking_course_id IN (23, 24826);
  UPDATE booking_course SET active = false WHERE id IN (23, 24826);
  Chase EUR 250 from student/agent, reconcile pmt17683 in Xero.
  Once paid: UPDATE booking SET confirmed = true WHERE id = 18034;

Risk: money (EUR 250) + data-hygiene; reversible.
Status: Unchanged. Fix NOT RUN. Last checked 2026-08-14 UTC, 64th check.

Issue 15 - Saikhantes Shagdarsuren (service_end expired)
Reporter: AC | Area: Booking/Class | Sheet row: 16 | 103rd check Wed 12 Aug 2026 UTC

Symptom: Course dates and holidays look wrong; student unassigned from class since Jul 3.

Root Cause (confirmed):
  Booking 18151: CONFIRMED, EUR 1339.20 paid, EUR 0 open, student 1001
  service_end = 2026-08-07 — now 5 days expired (student still attending)
  Booking Course 24925 (Academic Year Afternoon): active, ends 2 Oct 2026 (51 days remaining)
  Class Assignment 255: weekEnd = 2026-07-03 — 40 days expired (student unassigned)
  Xero payment reconciliation still pending

Fix Recipe (NOT YET RUN):
  1. Extend Booking 18151 service_end to 2026-10-02 (matches BC 24925 end):
     UPDATE bookings SET service_end = 2026-10-02 WHERE id = 18151;
  2. Renew/extend Class Assignment 255 weekEnd to 2026-10-02:
     UPDATE class_assignments SET week_end = 2026-10-02 WHERE id = 255;
     (Or deactivate 255 and INSERT a new CA for 2026-07-04 to 2026-10-02, class_id same as 255)
  3. Reconcile Booking 18151 payment in Xero (check fins/ for matching invoice).

Risk: Bookings/attendance. Reversible. Blast radius: 1 student.
Status: OPEN - NOT YET RUN. 103rd check. Student untracked for 40 days.
Last checked: Wed 12 Aug 2026 UTC
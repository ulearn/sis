Issue 48 - Stale BCs + Orphan Payments (65th check)
Reporter: AC | Area: Attendance/classes | Sheet row: 50

Status Update: Fri 7 Aug 2026 UTC (65th check)
UNCHANGED. BCs 24630/24631 now 28 days stale (ended 10 Jul). Orphan payments unchanged.

Current State
Booking Courses (active=true, past end date):
- BC 24630 (General English AM Plus, bk 17857): ended 10 Jul 2026 - 28 days stale, 0 SCAs
- BC 24631 (General English AM Plus, bk 17856): ended 10 Jul 2026 - 28 days stale, 0 SCAs
- BC 25006 (General English AM Plus, bk 18228): ended 3 Aug 2026 - 4 days stale, 2 SCAs

Orphan payments (all bookingId=null, xeroPaymentId=null - see Issue 1):
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026
- Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026
- Payment 4781: EUR 380, Flywire, Aug 2019 (legacy)

Fix Recipe (NOT YET RUN)
Step 1 - Deactivate BCs 24630 and 24631 (0 SCAs, safe):
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id IN (24630, 24631);

Step 2 - BC 25006 has 2 SCAs - verify completion before deactivating:
  SELECT * FROM student_class_assignments WHERE booking_course_id = 25006;
  If complete: UPDATE booking_courses SET active=false WHERE id=25006;

Step 3 - Orphan payments: follow issue-1-addendum-7aug.md recipe.

Risk: data hygiene | reversible | low blast radius.
Status: Fix NOT RUN. Last checked: Fri 7 Aug 2026 UTC (65th hourly check).
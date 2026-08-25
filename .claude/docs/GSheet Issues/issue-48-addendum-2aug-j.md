# Issue 48 — Galbusera/Fassina + ILEP Students (Addendum 2 Aug 2026, check #36)
Sheet row: 50 | Reporter: AC | Area: Attendance/classes

UNCHANGED (36th hourly check Sun 2 Aug 2026 UTC, 11th today):

Galbusera/Fassina sub-issue:
- Booking 17856 (Galbusera): CONFIRMED, confirmed=false, amountTotal=339.90, amountOpen=null, 0 SIS payments
  - Booking course 24631 (General English AM Plus, ended 2026-07-10): active=true — 23 days stale
- Booking 17857 (Fassina): CONFIRMED, confirmed=false, amountTotal=339.90, amountOpen=null, 0 SIS payments
  - Booking course 24630 (General English AM Plus, ended 2026-07-10): active=true — 23 days stale
- Orphan payments 16988 (EUR 339.90) + 16989 (EUR 339.90): bookingId=null, xeroPaymentId=null — 97 days
  HubSpot payment IDs 1204827374829 + 1204846469317 (type=one_time_or_initial, amounts match bookings exactly)
  See Issue 1 for full orphan payment context.

ILEP students (Uyanga, Ana Jessica, Telmuun, Arunsarnai, Saikhantes, Enshi): resolved in prior checks.
Remaining open items are the two stale booking courses and two orphan payments above.

Fix recipe (NOT YET RUN):
Step 1: Verify HubSpot IDs 1204827374829 + 1204846469317 match Galbusera+Fassina deals.
Step 2: UPDATE payment SET bookingId=17856 WHERE id=16988;
        UPDATE payment SET bookingId=17857 WHERE id=16989;
Step 3: UPDATE bookingCourse SET active=false WHERE id IN (24630, 24631);
Step 4: SET confirmed=true on bookings 17856+17857 once payments verified.

Risk: Bookings + Money — linking orphan payments. Reversible. Blast: 2 bookings, 2 booking courses, 2 payments.
Status: OPEN — fix NOT RUN. Last checked: Sun 2 Aug 2026 UTC

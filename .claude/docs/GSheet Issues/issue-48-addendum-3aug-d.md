Issue 48 -- Class Assignment / Attendance (42nd check Mon 3 Aug 2026 UTC, 5th today)
Reporter: PG/KC | Area: Attendance/classes | Sheet row: 50

Root Cause (fresh 3 Aug 2026 UTC -- all unchanged):
- BC 24630 (General English AM Plus, ended Jul 10 2026): active=true -- 25 days stale
- BC 24631 (General English AM Plus, ended Jul 10 2026): active=true -- 25 days stale
- Payment 16988 (EUR 339.90): booking_id=null, xero_payment_id=null -- unlinked
- Payment 16989 (EUR 339.90): booking_id=null, xero_payment_id=null -- unlinked
- Bookings 17856+17857: CONFIRMED, confirmed=false, 0 linked payments

Fix Recipe (NOT YET RUN):
Step 1: UPDATE booking_courses SET active=false WHERE id IN (24630,24631);
Step 2: UPDATE payments SET booking_id=17857 WHERE id=16988;
        UPDATE payments SET booking_id=17856 WHERE id=16989;
        (16988=Fassina->bk17857, 16989=Galbusera->bk17856)
Step 3: UPDATE bookings SET confirmed=true WHERE id IN (17856,17857);

Risk: bookings/money | Reversible: yes | Blast: 2 bookings (Fassina + Galbusera)
Status: 42nd check Mon 3 Aug 2026 UTC (5th today). BCs 25d stale. Payments unlinked. NOT RUN.
Last checked: 2026-08-03 UTC
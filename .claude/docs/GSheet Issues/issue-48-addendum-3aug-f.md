# Issue 48 - Galbusera/Fassina 4 Open Items (45th check Mon 3 Aug 2026 UTC, 8th today)
Reporter: PG | Area: Attendance/Classes | Sheet row: 50

Root Cause (fresh) -- ALL UNCHANGED:
- BC 24630 (Fassina, GE AM Plus, bk17857): active=true, ended Jul 10 2026 -- 24 days stale
- BC 24631 (Galbusera, GE AM Plus, bk17856): active=true, ended Jul 10 2026 -- 24 days stale
- Payment 16988 (EUR 339.90): booking_id=null -- orphan, should link to booking 17856 (Galbusera)
- Payment 16989 (EUR 339.90): booking_id=null -- orphan, should link to booking 17857 (Fassina)
- Booking 17856 (Galbusera): status=CONFIRMED, confirmed=false, amount_paid=EUR 339.90, amount_open=null
- Booking 17857 (Fassina): status=CONFIRMED, confirmed=false, amount_paid=EUR 339.90, amount_open=null

Fix Recipe (NOT YET RUN):
Step 1: UPDATE booking_courses SET active=false,updated_at=NOW() WHERE id IN (24630,24631);
Step 2: UPDATE payments SET booking_id=17856,updated_at=NOW() WHERE id=16988;
Step 3: UPDATE payments SET booking_id=17857,updated_at=NOW() WHERE id=16989;
Step 4: UPDATE bookings SET confirmed=true,updated_at=NOW() WHERE id IN (17856,17857);
Step 5: SELECT id,booking_id FROM payments WHERE id IN (16988,16989); SELECT id,confirmed FROM bookings WHERE id IN (17856,17857);

Risk: bookings/payments | Reversible: yes | Blast: 2 students + 2 payments
Status: 45th check. 4 items unchanged. Fix NOT RUN. Last checked: 2026-08-03 UTC

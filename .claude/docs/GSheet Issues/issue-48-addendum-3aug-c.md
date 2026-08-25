Issue 48 - Class Assignment Attendance - 40th check Mon 3 Aug 2026 UTC (3rd today)

Root Cause (confirmed 2026-08-03, 40th check - 4 items still open):
Item 1: BC24630 (Fassina, ended Jul10): active=true, 25 days stale. Bk17857: CONFIRMED, confirmed=false, EUR339.90 paid, 0 pmts linked.
Item 2: BC24631 (Galbusera, ended Jul10): active=true, 25 days stale. Bk17856: CONFIRMED, confirmed=false, EUR339.90 paid, 0 pmts linked.
Item 3: Orphan pmts 16988+16989: EUR339.90 each, booking_id=null. Coordinate with Issue 1.

Fix Recipe - NOT YET RUN
Step 1: UPDATE booking_courses SET active=false WHERE id IN (24630,24631);
Step 2: UPDATE payments SET booking_id=17857 WHERE id=16988;
        UPDATE payments SET booking_id=17856 WHERE id=16989;
Step 3: UPDATE bookings SET confirmed=true WHERE id IN (17856,17857);

Risk: Bookings, money, attendance. 2 bookings. Reversible.
Status: UNCHANGED. BCs 25d stale, pmts unlinked. Fix NOT RUN.
Last checked: 2026-08-03 UTC (40th hourly check, 3rd today)
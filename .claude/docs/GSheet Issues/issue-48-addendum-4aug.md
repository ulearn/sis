# Issue 48 - Class Assignment + Attendance Anomalies (46th check Tue 4 Aug 2026 UTC)
Reporter: PG | Area: Attendance/Classes | Sheet row: 50

## Root Cause (fresh - 2026-08-04 UTC)

Fassina/Galbusera search blocked by stale BCs and unlinked payments:
- BC 24630 (Fassina, GE AM Plus, ended Jul 10): active=true, 25 days stale
- BC 24631 (Galbusera, GE AM Plus, ended Jul 10): active=true, 25 days stale
- BC 25006 (Marina Larripa, ended Aug 3): active=true, 1 day stale (also Issues 1 and 38)
- Payment 16988 (EUR 339.90): booking_id=null -- link to booking 17856 (Galbusera)
- Payment 16989 (EUR 339.90): booking_id=null -- link to booking 17857 (Fassina)
- Bookings 17856+17857: CONFIRMED, confirmed=false, 0 payments linked

ILEP students (Uyanga, Ana Jessica, Telmuun, Arunsarnai): blocked by 24,467 stale BCs broadly.
Systemic fix: Issue 45 bulk deactivation.

## Fix Recipe (NOT YET RUN)

NOTE: Overlaps with Issue 1 recipe. Run that first.

Step 1 - Deactivate stale BCs:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (24630, 24631);

Step 2 - Link payments + fix confirmed:
  UPDATE payments SET booking_id = 17856, updated_at = NOW() WHERE id = 16988;
  UPDATE payments SET booking_id = 17857, updated_at = NOW() WHERE id = 16989;
  UPDATE bookings SET confirmed = true, updated_at = NOW() WHERE id IN (17856, 17857);

Step 3 - For ILEP students: run Issue 45 bulk deactivation, then re-test search.

Step 4 - Saikhantes/Enshi individual investigation (after bulk fix):
  SELECT bc.id, bc.start_date, bc.end_date, bc.active, s.first_name
  FROM booking_courses bc JOIN bookings bk ON bk.id=bc.booking_id JOIN students s ON s.id=bk.student_id
  WHERE s.first_name ILIKE 'Saikhantes' OR s.first_name ILIKE 'Enshi';

Step 5 - Verify:
  SELECT id, active FROM booking_courses WHERE id IN (24630, 24631, 25006);
  SELECT id, booking_id FROM payments WHERE id IN (16988, 16989);

## Risk
Category: bookings, data-hygiene | Reversible: yes | Blast: Fassina, Galbusera primarily

## Status: NOT RUN. Last checked: 2026-08-04 UTC
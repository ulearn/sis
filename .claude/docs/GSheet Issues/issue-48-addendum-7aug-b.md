Issue 48 — Multiple Students (Uyanga, Ana Jessica, Telmuun, Arunsarnai, Francesca, Margherita)
Reporter: AC | Area: Attendance/classes | Sheet row: 50
Status Update: Fri 7 Aug 2026 UTC (66th check) — G updated by staff; new students named

SYMPTOM
Students cannot be found in SIS to assign to class. Saikhantes cannot be re-assigned. Enshi dates wrong.

ROOT CAUSE (verified this check)

Stale Booking Courses (active past end date):
- Booking Course 24630 (General English AM Plus, bk 17857): ended 10 Jul 2026, active=true — 28 days stale, 0 class assignments
- Booking Course 24631 (General English AM Plus, bk 17856): ended 10 Jul 2026, active=true — 28 days stale, 0 class assignments
- Booking Course 25006 (General English AM Plus, bk 18228): ended 3 Aug 2026, active=true — 4 days stale, 2 class assignments

Francesca Fassini — NOT IN SIS:
- No student record found matching Francesca Fassini in any form — student does not exist in SIS
- Needs to be created (check HubSpot for deal, then trigger deal-won or create manually)

Margherita Galbusera (student 14461) — anomaly:
- Booking 17856: CONFIRMED, confirmed=false, EUR 339.90 paid (amountTotal=amountPaid), serviceEnd=null
- Booking Course 24631 linked to booking 17856 (stale, see above)
- Orphan payment 16988 (EUR 339.90, Bank, 28 Apr 2026): bookingId=null — amount matches booking 17856

Orphan payments (all bookingId=null, xeroPaymentId=null):
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 — likely belongs to bk 17856 (Margherita)
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 — likely belongs to bk 17857
- Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026 — see Issue 1
- Payment 4781: EUR 380, Flywire, Aug 2019 — legacy Fidelo

Cross-references:
- Saikhantes: see Issue 15 (service_end expired today — URGENT)
- Enshi: see Issue 23 (BC 828 backwards dates)

FIX RECIPE (NOT YET RUN)

Step 1 — Deactivate stale BCs with 0 SCAs (safe):
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id IN (24630, 24631);

Step 2 — BC 25006 has 2 SCAs — verify before deactivating:
  SELECT id, class_id, week_end FROM student_class_assignments WHERE booking_course_id=25006;
  If complete: UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=25006;

Step 3 — Link orphan payment 16988 to booking 17856 (Margherita):
  Verify: SELECT id, amount, method FROM payments WHERE id=16988;
  If confirmed: UPDATE payments SET booking_id=17856, updated_at=NOW() WHERE id=16988;

Step 4 — Set booking 17856 confirmed=true and serviceEnd:
  UPDATE bookings SET confirmed=true, service_end='2026-07-10', updated_at=NOW() WHERE id=17856;

Step 5 — Link orphan payment 16989 to booking 17857:
  Verify: SELECT id, amount_total, amount_paid FROM bookings WHERE id=17857;
  If confirmed: UPDATE payments SET booking_id=17857, updated_at=NOW() WHERE id=16989;

Step 6 — Create Francesca Fassini in SIS:
  Check HubSpot for deal for Francesca Fassini.
  If deal exists: trigger deal-won webhook or use SIS admin.
  If no deal: confirm with staff (AC) whether she was a paying student.

RISK
Category: bookings, data-hygiene, money (orphan payments). Reversible: yes. Blast radius: up to 6 students, 3 payments.

STATUS
Fix NOT RUN. Last checked: Fri 7 Aug 2026 UTC (66th hourly check).
NEW this check: Francesca Fassini not in SIS; Margherita bk 17856 confirmed=false; payment 16988 likely links to bk 17856.

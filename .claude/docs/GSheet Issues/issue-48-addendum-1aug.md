ISSUE 48 — Galbusera + Fassina: stale BCs + confirmed=false anomaly
====================================================================

Area: Attendance/Classes  Row: 50  Checked: 2026-08-01 UTC (18th hrly)

SYMPTOM
-------
Galbusera and Fassina cannot be found in SIS class search. Both completed Jun 29–Jul 10. Confirmed=false despite payment received.

ROOT CAUSE / DB STATE (confirmed 2026-08-01 UTC)
------------------------------------------------
- Booking 17856 (Margherita Galbusera s14461): status=CONFIRMED, confirmed=false (ANOMALY), paid=EUR 339.90, open=null.
- Booking 17857 (Francesca Fassina s14462): status=CONFIRMED, confirmed=false (ANOMALY), paid=EUR 339.90, open=null.
- BC24631 (bk17856, General English AM Plus, Jun 29–Jul 10): active=true, 0 SCAs — 22 days stale.
- BC24630 (bk17857, General English AM Plus, Jun 29–Jul 10): active=true, 0 SCAs — 22 days stale.
- Root cause: confirmed=false blocks SIS class-search visibility despite CONFIRMED status + payment.
- Saikhantes (4th item in original report): tracked in Issue 15.

FIX RECIPE (NOT YET RUN)
------------------------

Step 1 — Set confirmed=true on both bookings (NOT YET RUN):
  UPDATE booking SET confirmed = true WHERE id IN (17856, 17857);

Step 2 — Deactivate stale BCs (courses ended Jul 10 — 22 days ago):
  UPDATE booking_course SET active = false WHERE id IN (24630, 24631);

Step 3 — Verify:
  SELECT id, confirmed, status, amount_paid FROM booking WHERE id IN (17856, 17857);
  SELECT id, active, start_date, end_date FROM booking_course WHERE id IN (24630, 24631);

Step 4 — Note on attendance (optional):
  Both students completed without SCAs. If retroactive attendance needed, confirm class IDs with Paul.
  This is cosmetic since courses are complete.

RISK
----
Category: bookings/data-hygiene. Reversible: yes. Blast radius: 2 students, 2 completed bookings.

STATUS: OPEN — courses complete; confirmed fix + deactivation needed
Last checked: 2026-08-01 UTC (2nd check of day)
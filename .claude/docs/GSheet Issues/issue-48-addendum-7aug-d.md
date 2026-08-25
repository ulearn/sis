# Issue 48 — Renewal Students / Fassina=Fassini Confirmed (68th check, 7 Aug 2026)
Reporter: AC | Area: Attendance / Classes | Sheet row: 50 | 68th hrly check Fri 7 Aug 2026 UTC

Root cause (verified Fri 7 Aug 2026 UTC — bk17857 student identity directly confirmed):
- Booking 17857 student = Francesca Fassina (student 14462, francescafassina98@gmail.com) — confirmed via direct booking query
- No record with surname Fassini in SIS — Fassina almost certainly = Fassini (one-letter variant)
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amount_paid=EUR 339.90, 0 direct payments, service_end=null
- Booking 17857 (Francesca Fassina, student 14462): CONFIRMED, confirmed=false, amount_paid=EUR 339.90, 0 direct payments
- Booking Course 24630 (General English AM Plus, ended 10 Jul 2026): active=true, 28 days stale, 0 SCAs (bk17857)
- Booking Course 24631 (General English AM Plus, ended 10 Jul 2026): active=true, 28 days stale, 0 SCAs (bk17856)
- Orphan payments 16988/16989 (EUR 339.90 each, Bank, 28 Apr 2026): booking_id=null — amounts match bookings exactly

Fix recipe (NOT YET RUN):

Step 1 — Confirm Fassina = Fassini with staff:
  Ask: Is student Francesca Fassina (14462, francescafassina98@gmail.com) = Francesca Fassini in the report?
  If YES: no new record needed. Optionally fix spelling.
  If NO: create new student for Francesca Fassini.

Step 2 — Link orphan payments (coordinate with Issue 1, do not double-run):
  UPDATE payments SET booking_id=17856 WHERE id=16988;
  UPDATE payments SET booking_id=17857 WHERE id=16989;

Step 3 — Confirm bookings:
  UPDATE bookings SET confirmed=true, amount_paid=339.90, amount_open=0 WHERE id IN (17856, 17857);

Step 4 — Fix service_end on bk17856 (currently null):
  -- Verify against HubSpot deal first; BC end date 10 Jul 2026 is a reasonable proxy.
  UPDATE bookings SET service_end='2026-07-10' WHERE id=17856;

Step 5 — Deactivate stale booking courses:
  UPDATE booking_courses SET active=false WHERE id IN (24630, 24631);

Step 6 — Saikhantes Shagdarsuren: SCA anomaly (SIS blocks re-assignment) — resolve via SIS Admin.

Risk: Data hygiene + financial | Reversible | Fassina/Fassini confirmation required before Step 1
Status: NOT RUN | Last checked: Fri 7 Aug 2026 UTC (68th check)
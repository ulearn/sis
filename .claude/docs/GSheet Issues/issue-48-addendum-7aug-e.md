Issue 48 - Renewal Students / Fassina=Fassini (69th check, 7 Aug 2026)
Reporter: AC | Sheet row: 50

Root Cause (verified live - unchanged from 68th check):
- Booking 17857 student = Francesca Fassina (student 14462, francescafassina98@gmail.com) - confirmed
- No record with surname Fassini in SIS - Fassina almost certainly = Fassini (one-letter variant)
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amount_paid=EUR 339.90, 0 direct payments, service_end=null
- Booking 17857 (Francesca Fassina, student 14462): CONFIRMED, confirmed=false, amount_paid=EUR 339.90, 0 direct payments
- Booking Courses 24630 and 24631 (General English AM Plus, ended Jul 10 2026): active, 28 days stale, 0 SCAs
- Orphan payments 16988/16989 (EUR 339.90 each, Bank, 28 Apr 2026): booking_id=null - amounts match bookings exactly

Fix Recipe (NOT YET RUN - coordinate with Issue 1, do not double-run):
Step 1 - Confirm identity with staff:
  Is student 14462 Francesca Fassina (francescafassina98@gmail.com) = Francesca Fassini in report?
  If YES: no new record needed; optionally fix spelling.
  If NO: create new student for Francesca Fassini.

Step 2 - Link orphan payments:
  UPDATE payments SET booking_id=17856 WHERE id=16988;
  UPDATE payments SET booking_id=17857 WHERE id=16989;

Step 3 - Confirm bookings:
  UPDATE bookings SET confirmed=true, amount_paid=339.90, amount_open=0 WHERE id IN (17856, 17857);

Step 4 - Fix service_end on bk17856 (null):
  Verify against HubSpot; use BC end date 10 Jul 2026 as proxy.
  UPDATE bookings SET service_end=2026-07-10 WHERE id=17856;

Step 5 - Deactivate stale BCs:
  UPDATE booking_courses SET active=false WHERE id IN (24630, 24631);

Risk: Financial/Identity | Reversible | Low blast radius
Status: Fix NOT RUN | Last checked: Fri 7 Aug 2026 UTC (69th check)

Issue 48 Addendum  31 Jul 2026 (k)  4 Items Open: Unchanged
Reporter: Paul / Staff  Area: Attendance / Classes  Sheet row: 50
Last checked: 2026-07-31 UTC (17th hourly check)

CURRENT DB STATE (this run)
- Booking 17856 (Margherita Galbusera, s14461): confirmed=false, amount_paid=EUR 339.90, amount_open=null
- Booking 17857 (s14462 / Fassina): confirmed=false, amount_paid=EUR 339.90, amount_open=null
- BC 24631 (bk17856, General English AM Plus, Jun 29-Jul 10): active=true, 0 SCAs -- 21 days stale
- BC 24630 (bk17857, General English AM Plus, Jun 29-Jul 10): active=true, 0 SCAs -- 21 days stale
- Saikhantes SCA (4th open item): tracked in Issue 15 (returns 24 Aug 2026).
All unchanged.

FIX RECIPE (NOT YET RUN)

Step 1 -- Set confirmed = true on bookings 17856 and 17857
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 2 -- Deactivate stale BCs 24630 and 24631 (ended Jul 10, now 21 days past end)
  Verify no ongoing activity first.
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Note: Saikhantes class assignment for Aug 24 onward covered by Issue 15 recipe.

RISK / CATEGORY
- Category: bookings / data-hygiene
- Reversible: yes
- Blast radius: 2 students, cosmetic

STATUS
NOT RUN. 17th hourly check (Fri 31 Jul 2026). Galbusera + Fassina BCs 21d stale, 0 SCAs, confirmed=false. Saikhantes in Issue 15.
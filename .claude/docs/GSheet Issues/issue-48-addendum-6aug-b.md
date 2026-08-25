Issue 48 -- Stale Booking Courses + Orphan Payments (61st check)

Reporter: AC | Area: Attendance/Classes | Row: 50 | Check: 61st Thu 6 Aug 2026 UTC

61st hourly check -- no change since 60th. 3 booking courses still active past end date.
Orphan payments unchanged (see Issue 1).

== Root cause ==

Booking course 25006 (General English AM Plus):
- active = true, end_date = 2026-08-03 -- 4 days stale (booking 18228)

Booking course 24630 (General English AM Plus):
- active = true, end_date = 2026-07-10 -- 28 days stale (booking 17857, student 14462 Francesca Fassina)

Booking course 24631 (General English AM Plus):
- active = true, end_date = 2026-07-10 -- 28 days stale (booking 17856, student 14461 Margherita Galbusera)

4 orphan payments (booking_id = null) -- see Issue 1 for details (unchanged).

== Fix recipe (NOT YET RUN) ==

Step 1 -- Deactivate stale booking courses:
  UPDATE public.booking_courses
  SET active = false
  WHERE id IN (25006, 24630, 24631)
    AND end_date < CURRENT_DATE
    AND active = true;

Step 2 -- Verify:
  SELECT id, name, active, end_date::date FROM public.booking_courses WHERE id IN (25006, 24630, 24631);

Step 3 -- Link orphan payments (see Issue 1 recipe for full detail):
- Payment 16988 (EUR 339.90, Bank, Apr 2026) -> link to booking 17857 (Francesca Fassina)
- Payment 16989 (EUR 339.90, Bank, Apr 2026) -> link to booking 17856 (Margherita Galbusera)
- Payment 17187 (EUR 6,151, TransferMate Escrow) -> pending decision
- Payment 4781 (EUR 380, Flywire, Aug 2019) -> Fidelo legacy; review separately

== Risk / category ==

- Category: data-hygiene, bookings
- Risk: low -- deactivating ended courses is safe and reversible
- Reversible: yes (SET active = true to undo)
- Blast radius: 3 booking courses, 3 students (bookings 18228, 17857, 17856)

== Status ==

OPEN -- fix NOT RUN. 3 stale booking courses (4-28 days past end date). Orphan payments overlap Issue 1.

Last checked: Thu 6 Aug 2026 UTC (61st hourly check)
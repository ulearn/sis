# Issue 1 — Orphan Payments + Stale Booking Courses (161st check)

Reporter: NM | Area: Cleanup | Row: 2
Check: 161st Thu 6 Aug 2026 UTC. Fix NOT RUN.

## Symptom

Orphan payments with no booking_id. Booking courses ended but still active = true.

## Root cause (161st check Thu 6 Aug 2026 UTC — unchanged)

4 orphan payments (booking_id = null):
- Payment 4781: EUR 380, type null, payment date 20 Aug 2019, txid D20191404 — legacy (7+ years)
- Payment 16988: EUR 339.90, type one_time_or_initial, payment date 28 Apr 2026 — 100 days orphaned
- Payment 16989: EUR 339.90, type one_time_or_initial, payment date 28 Apr 2026 — 100 days orphaned
- Payment 17187: EUR 6,151, type null, payment date 1 May 2026, txid D2026226 — 97 days orphaned

Related bookings (payments 16988/16989):
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed = false, amount paid = EUR 339.90
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed = false, amount paid = EUR 339.90

3 stale booking courses (active = true, end date past):
- Booking course 24630: General English AM Plus, ended 10 Jul 2026 — 27 days stale (booking 17857)
- Booking course 24631: General English AM Plus, ended 10 Jul 2026 — 27 days stale (booking 17856)
- Booking course 25006: General English AM Plus, ended 3 Aug 2026 — 3 days stale (booking 18228)

## Fix recipe (NOT YET RUN)

Step 1 — Link payments 16988 and 16989 to bookings 17857 and 17856 respectively:
  UPDATE public.payments SET booking_id = 17857 WHERE id = 16988;
  UPDATE public.payments SET booking_id = 17856 WHERE id = 16989;

Step 2 — Fix confirmed = false on bookings 17856 and 17857:
  UPDATE public.bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 3 — Deactivate 3 stale booking courses:
  UPDATE public.booking_courses SET active = false WHERE id IN (24630, 24631, 25006);

Step 4 — Payment 17187 (EUR 6,151 TransferMate, txid D2026226): investigate which booking this belongs to.
  Check TransferMate records and HubSpot deals for D2026226.
  Then: UPDATE public.payments SET booking_id = <booking_id> WHERE id = 17187;

Step 5 — Payment 4781 (EUR 380, 2019): legacy; decide whether to delete or leave.

## Risk / category

- Category: payments, bookings, data-hygiene
- Risk: medium — linking payments and updating confirmed is reversible but affects financial reporting
- Reversible: yes (each UPDATE can be reversed)
- Blast radius: 2 confirmed students (Galbusera, Fassina) + 1 unknown (17187 TransferMate)

## Status

OPEN — fix NOT RUN. 100 days since payments 16988/16989 were orphaned.

Last checked: Thu 6 Aug 2026 UTC (161st hourly check)
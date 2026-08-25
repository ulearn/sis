Issue 1 -- Orphan payments + stale booking courses (273rd check)

Reporter: NM | Area: Cleanup | Sheet row: 2 | Last checked: 2026-08-19 UTC

Symptom:
Orphan payments (booking_id = null); confirmed = false on fully-paid bookings; stale booking courses.

Root cause (no change since 18 Aug):
- Payment 4781: EUR 380, Flywire, 20 Aug 2019 -- booking_id = null (legacy orphan)
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 -- booking_id = null (likely Booking 17856)
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 -- booking_id = null (likely Booking 17857)
- Payment 17187: EUR 6,151, TransferMate, ref D2026226 -- booking_id = null (2025 service, leave)
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, paid=EUR 339.90, total=EUR 339.90
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false, paid=EUR 339.90, total=EUR 339.90
- Booking Course 24630 (General English AM Plus, Booking 17857): ended 2026-07-10, active=true, 0 SCAs -- 40d stale
- Booking Course 24631 (General English AM Plus, Booking 17856): ended 2026-07-10, active=true, 0 SCAs -- 40d stale

Fix recipe (NOT YET RUN):
1. UPDATE payments SET booking_id = 17856 WHERE id = 16988;
2. UPDATE payments SET booking_id = 17857 WHERE id = 16989;
3. UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);
4. UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);
5. Payment 4781: leave as-is (2019 legacy, no match).
6. Payment 17187: leave as-is (2025 service).

Risk: Money: medium (verify amounts match). Reversible.

Status: 273rd check -- no change. Fix pending Neil approval. Last checked: 2026-08-19 UTC
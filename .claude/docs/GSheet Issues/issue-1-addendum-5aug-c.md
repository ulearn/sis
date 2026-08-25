# Issue 1 — Orphan Payments + Stale Booking Courses (149th check)

Reporter: NM | Area: Cleanup | Sheet row 2 | Last checked: 2026-08-05 UTC

## Orphan Payments — unchanged (108 days)

Payment 16988: EUR 339.90, method Bank, booking_id = null, xero_payment_id = null
Payment 16989: EUR 339.90, method Bank, booking_id = null, xero_payment_id = null
Payment 17187: EUR 6,151, method TransferMate Escrow, transaction D2026226, booking_id = null
Payment 4781: EUR 380, method Flywire, transaction D20191404, booking_id = null (legacy 2019)

NEW FINDING (5 Aug): Booking 17856 (Margherita Galbusera) now shows amount_paid = 339.90,
amount_open = 0 — but no payment records are linked (booking_id = null for pmt 16989).
Similarly booking 17857 (Francesca Fassina) shows amount_paid = 339.90, amount_open = 0
with no payment linked. Amounts match the orphan payments exactly.
Possible: amounts were manually updated on the booking records without formally linking.
Both bookings still have confirmed = false (anomaly).

## Stale Booking Courses

BC 25006 (Marina Larripa): ended 2026-08-03 (2 days stale), active = true, 2 SCAs
  Last SCA: week ending 2026-08-02 — course properly ran to completion. Safe to deactivate.
BC 24630 (Francesca Fassina): ended 2026-07-10 (26 days stale), active = true, 0 SCAs
BC 24631 (Margherita Galbusera): ended 2026-07-10 (26 days stale), active = true, 0 SCAs

## Fix recipe (NOT YET RUN)

Step 1 — Investigate bk17856 / bk17857 partial reconciliation:
Check whether Neil manually updated amount_paid on these bookings. If so, link the
corresponding orphan payments formally:
  UPDATE payments SET booking_id = 17856 WHERE id = 16989;
  UPDATE payments SET booking_id = 17857 WHERE id = 16988;
(Confirm which payment maps to which booking before running.)

Step 2 — Fix confirmed = false on bk17856 + bk17857:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 3 — Deactivate stale booking courses:
  UPDATE booking_courses SET active = false WHERE id IN (25006, 24630, 24631);

Step 4 — Handle remaining orphan payments:
  Payment 17187 (EUR 6,151, TransferMate, D2026226): identify correct booking and link.
  Payment 4781 (EUR 380, Flywire, 2019): likely legacy; discuss with Neil — may be a write-off.

Risk: money / bookings | Reversible with audit log | Blast radius: low (4 payments, 3 BCs)
Status: OPEN — 149th check 2026-08-05 UTC. NOT YET RUN.
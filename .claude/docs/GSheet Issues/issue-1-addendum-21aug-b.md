# Issue 1 Addendum 21 Aug 2026 (Very Late Evening) — Orphan Payments

Reporter: NM | Area: Cleanup | Sheet row: 2

Symptom: Orphan payments and stale booking courses from migration.

Root cause (283rd check, Fri 21 Aug 2026 very late evening — no change since 282nd):

Orphan payments (no booking link, Xero null):
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026, booking_id = null. Match: Booking 17857 (Francesca Fassina), EUR 339.90, 0 linked payments.
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026, booking_id = null. Match: Booking 17856 (Margherita Galbusera), EUR 339.90, 0 linked payments.

Stale booking courses (ended Jul 10, still active):
- Booking Course 24630 (General English AM Plus, booking 17857): ended 10 Jul 2026, active = true — 42 days stale.
- Booking Course 24631 (General English AM Plus, booking 17856): ended 10 Jul 2026, active = true — 42 days stale.

Legacy orphans (low priority, leave as-is):
- Payment 17187: EUR 6,151 TransferMate Escrow — do not touch.
- Payment 4781: EUR 380, Flywire 2019 — low priority legacy.

Fix recipe (NOT YET RUN):

Step 1 — Link orphan payments to their bookings:
  UPDATE payments SET booking_id = 17856 WHERE id = 16989;
  UPDATE payments SET booking_id = 17857 WHERE id = 16988;

Step 2 — Deactivate stale booking courses:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (24630, 24631);

Verify:
  SELECT id, amount, method, booking_id FROM payments WHERE id IN (16988, 16989);
  SELECT id, name, active, end_date FROM booking_courses WHERE id IN (24630, 24631);

Risk: data-hygiene | Reversible: yes | Blast radius: 2 payments, 2 booking courses
Status: Fix NOT RUN.
Last checked: 2026-08-21 Fri very late evening (283rd check)
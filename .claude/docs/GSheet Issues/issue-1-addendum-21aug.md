# Issue 1 Addendum 21 Aug 2026 (Late Evening) — Orphan Payments + Stale Booking Courses

Reporter: NM | Area: Cleanup | Sheet row: 2

Symptom: Orphan payments (booking_id = null) and stale active booking courses post-migration.

Root cause (282nd check, Fri 21 Aug 2026 late evening — fresh DB verification):

Orphan payments:
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026, booking_id = null.
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026, booking_id = null.
- Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026, booking_id = null — leave as-is (escrow holding).
- Payment 4781: EUR 380, Flywire, 20 Aug 2019, booking_id = null — legacy orphan, low priority.

Matching bookings (fresh check this run):
- Booking 17856 (Margherita Galbusera, student 14461): CONFIRMED, confirmed = false, amount_total = 339.90, amount_paid = 339.90.
  Zero payments currently linked to booking 17856 — Payment 16989 (EUR 339.90) is the missing record.
- Booking 17857 (Francesca Fassina, student 14462): CONFIRMED, confirmed = false, amount_total = 339.90, amount_paid = 339.90.
  Zero payments currently linked to booking 17857 — Payment 16988 (EUR 339.90) is the missing record.
  NOTE: amount_paid shows 339.90 on both bookings despite no linked payments — this field may be denormalized/set directly.

Stale active booking courses:
- Booking Course 24630 (General English AM Plus, booking 17857): ended 10 Jul 2026, active = true — 42 days stale.
- Booking Course 24631 (General English AM Plus, booking 17856): ended 10 Jul 2026, active = true — 42 days stale.

Fix recipe (NOT YET RUN):

Step 1 — Link Payment 16989 to Booking 17856 (Margherita):
  UPDATE payments SET booking_id = 17856, updated_at = NOW() WHERE id = 16989;

Step 2 — Link Payment 16988 to Booking 17857 (Francesca):
  UPDATE payments SET booking_id = 17857, updated_at = NOW() WHERE id = 16988;

Step 3 — Deactivate stale Booking Courses:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (24630, 24631);

Step 4 — Verify:
  SELECT id, booking_id, amount, method, payment_date FROM payments WHERE id IN (16988, 16989);
  SELECT id, active, end_date FROM booking_courses WHERE id IN (24630, 24631);
  Expect: payments linked to correct bookings; BCs active = false.

Note: Payment 17187 (escrow) and Payment 4781 (2019 legacy) left as-is — no fix needed.

Risk: data-hygiene + bookings | Reversible: yes | Blast radius: 2 bookings, 2 payments, 2 booking courses.
Status: Fix NOT RUN. Outstanding 282 checks.
Last checked: 2026-08-21 Fri late evening (282nd check)

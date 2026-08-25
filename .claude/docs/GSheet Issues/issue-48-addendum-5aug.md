Issue 48 — Stale BCs / Orphan Payments (52nd check Wed 5 Aug 2026 UTC)
Reporter: Staff | Area: Bookings/Payments | Sheet row: 50

Root Cause (verified 2026-08-05 UTC)

Progress — BC 25006 (Marina Larripa)
- Booking course 25006 (General English AM Plus, ended 2026-08-03): active = true — 2 days stale
- Now has 2 class assignments (was 0 as of 4 Aug). Progress on SCAs.
- Still needs deactivation.

Still open — stale BCs
- Booking course 24630 (Fassina, ended 2026-07-10): active = true — 26 days stale, 0 class assignments (booking 17857)
- Booking course 24631 (Galbusera, ended 2026-07-10): active = true — 26 days stale, 0 class assignments (booking 17856)

Still open — orphan payments
- Payment 16988: EUR 339.90, booking_id = null, xeroId = null — 99 days (created 2026-04-28) — matches booking 17856
- Payment 16989: EUR 339.90, booking_id = null, xeroId = null — 99 days (created 2026-04-28) — matches booking 17857

Fix Recipe (NOT YET RUN)
UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (24630, 24631, 25006);
UPDATE payments SET booking_id = 17856, updated_at = NOW() WHERE id = 16988;
UPDATE payments SET booking_id = 17857, updated_at = NOW() WHERE id = 16989;

Risk: data-hygiene, money | Reversible: yes | Blast radius: 3 BCs, 2 payments
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (52nd check) | Payment age: 99 days
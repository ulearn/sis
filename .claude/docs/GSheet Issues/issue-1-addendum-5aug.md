Issue 1 — Orphan Payments (147th check Wed 5 Aug 2026 UTC)
Reporter: NM | Area: Cleanup | Sheet row: 2

Root Cause (verified 2026-08-05 UTC, 147th check — all unchanged)
- Payment 16988: EUR 339.90, booking_id = null, xero_payment_id = null — matches booking 17856 (Galbusera)
- Payment 16989: EUR 339.90, booking_id = null, xero_payment_id = null — matches booking 17857 (Fassina)
- Payment 17187: EUR 6,151, transaction_id = D2026226, booking_id = null — origin unresolved
- Payment 4781: EUR 380, transaction_id = D20191404, legacy 2019 (7 years old)
- Booking course 24630 (Fassina, ended 2026-07-10): active = true — 26 days stale, 0 class assignments
- Booking course 24631 (Galbusera, ended 2026-07-10): active = true — 26 days stale, 0 class assignments
- Booking course 25006 (Marina Larripa, ended 2026-08-03): active = true — 2 days stale, 2 class assignments present
- Booking 17856 (Galbusera): status = CONFIRMED, confirmed = false — anomaly
- Booking 17857 (Fassina): status = CONFIRMED, confirmed = false — anomaly

Fix Recipe (NOT YET RUN)
  UPDATE payments SET booking_id = 17856, updated_at = NOW() WHERE id = 16988;
  UPDATE payments SET booking_id = 17857, updated_at = NOW() WHERE id = 16989;
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (24630, 24631, 25006);
  UPDATE bookings SET confirmed = true, updated_at = NOW() WHERE id IN (17856, 17857);
  -- Investigate payment 17187 (transaction D2026226) via Hub fins/ before linking.

Risk: data-hygiene, money | Reversible: yes | Blast radius: 4 payments, 3 BCs, 2 bookings
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (147th check) | Age: 106 days
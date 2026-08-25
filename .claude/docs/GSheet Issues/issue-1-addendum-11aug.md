ISSUE 1 — Orphaned Payments (214th Check)

Reporter: NM | Sheet row: 2 | Check: 214th Tue 11 Aug 2026 UTC

NO CHANGE since 213th check.

Orphaned payments (booking_id=null):
• Payment 4781: EUR 380, comment ULS771773625/21022 (2019, old Fidelo)
• Payment 16988: EUR 339.90, 2026-04-28 (likely booking 17856 Margherita Galbusera)
• Payment 16989: EUR 339.90, 2026-04-28 (likely booking 17857 Francesca Fassina)
• Payment 17187: EUR 6151, comment ULEARNP2026124 (needs manual match)

Bookings with amountPaid set but no linked payment:
• Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amountPaid=339.90, amountOpen=null
  BC 24631 (General English AM Plus): ended 2026-07-10, active=true (32d stale)
• Booking 17857 (Francesca Fassina): CONFIRMED, confirmed=false, amountPaid=339.90, amountOpen=null
  BC 24630 (General English AM Plus): ended 2026-07-10, active=true (32d stale)

CAUTION: amountPaid=339.90 already set. If derived from sum of linked payments, linking 16988/16989 will double-count. Pre-check: verify payments.length===0 on both bookings first.

Fix (NOT YET RUN):
1. Pre-check: findUnique booking 17856 include payments — if 0 linked, safe to proceed.
2. UPDATE payments SET booking_id=17856, updated_at=NOW() WHERE id=16988;
   UPDATE payments SET booking_id=17857, updated_at=NOW() WHERE id=16989;
3. UPDATE bookings SET confirmed=true, updated_at=NOW() WHERE id IN (17856,17857);
4. UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id IN (24630,24631);
5. Payment 17187 (EUR 6151): manual match needed. Do not link without Neil confirming.

Risk: money + data-hygiene. Reversible: yes. Blast: 2 students.
Status: No change. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (214th check)
Issue 1 - Orphan Payments + Systemic Stale Booking Courses

Reporter: NM | Area: Cleanup | Sheet row: 2

SYMPTOM
Payments 16988 and 16989 not linked to any booking in SIS. Expanded 18 Jul 2026: 4 total orphan payments found; 24,436 stale active booking courses system-wide.

ROOT CAUSE

Orphan payments (booking_id = null):
- Payment 16988 (EUR 339.90, HubSpot 1204827374829, created 28 Apr 2026): booking_id = null, 82 days unlinked
- Payment 16989 (EUR 339.90, HubSpot 1204846469317, created 28 Apr 2026): booking_id = null, 82 days unlinked
- Payment 4781 (EUR 380.00, Flywire, Fidelo 32056, ref ULS771773625/21022, created 10 Apr 2026): booking_id = null, no HubSpot ref, 99 days, Fidelo-era migration gap
- Payment 17187 (EUR 6151.00, TransferMate Escrow, Fidelo 37587, ref ULEARNP2026124, created 5 May 2026): booking_id = null, no HubSpot ref, 74 days, likely agency escrow

Target bookings for 16988/16989:
- Booking 17856 (Margherita Galbusera, student 14461): CONFIRMED, amount_total = 339.90, amount_paid = 339.90, confirmed = false (anomaly)
- Booking 17857 (Francesca Fassina, student 14462): CONFIRMED, amount_total = 339.90, amount_paid = 339.90, confirmed = false (anomaly)

Stale booking courses (active = true, end_date < now):
- Booking course 24631 (Margherita Galbusera, General English AM Plus, ended 10 Jul 2026): active = still true, 8 days stale
- Booking course 24630 (Francesca Fassina, General English AM Plus, ended 10 Jul 2026): active = still true, 8 days stale
- Also stale from Jul 10: BCs 103, 1455, 1615, 1650, 1653, 1697, 1773, 24670, 24872, 24907, 24931, 24933, 24934, 24936, 24937, 24968 (16 more across ~12 students)
- Also stale from Jul 17 (yesterday): 19 more courses including multiple AY students
- SYSTEMIC: 24,436 total booking courses have active = true with end_date < now; deactivation not running

Payments 4781 and 17187 investigation needed:
- 4781: Fidelo Flywire ref ULS771773625/21022; no booking match found; Fidelo-era migration gap
- 17187: Fidelo TransferMate Escrow ref ULEARNP2026124; EUR 6,151; no matching booking in DB; cross-reference TransferMate dashboard or HubSpot deals from May 2026

FIX RECIPE (NOT YET RUN)

Step 1 - Link payments 16988 and 16989:
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 2 - Investigate payments 4781 and 17187:
  - Check Fidelo migration CSV for payment 4781 (Fidelo 32056, ref ULS771773625/21022)
  - Cross-reference ULEARNP2026124 with TransferMate dashboard or HubSpot deals from May 2026
  - If match found: UPDATE payments SET booking_id = <id> WHERE id IN (4781, 17187);
  - If no match: decide (agency credit, escrow hold, or write-off)

Step 3 - Fix systemic stale booking courses (24,436 records):
  Option A (all ended): UPDATE booking_courses SET active = false WHERE active = true AND end_date < NOW();
  Option B (ended > 7 days, safer): UPDATE booking_courses SET active = false WHERE active = true AND end_date < NOW() - INTERVAL 7 days;
  Option C: Add cron or post-save hook in SIS to auto-deactivate when end_date passes.
  Recommended: Run Option B immediately, then implement Option C to prevent recurrence.

RISK / CATEGORY
- Payments 16988/16989: data-hygiene + bookings | Reversible: yes | Blast radius: low (2 payments, 2 bookings)
- Payments 4781/17187: investigation only | Blast radius: none until linked
- Stale BCs bulk update: data-hygiene | Reversible: yes | Blast radius: medium (24k rows, cosmetic; active flag affects UI filtering only)

STATUS
Open - fix NOT RUN.
Last checked: 2026-07-18 SAT UTC (69th check, hourly bot)

---
Previous checks (abridged):
- 2026-07-16 THU: pmts 16988/16989 unlinked; BCs 24630/24631 active (6d stale)
- 2026-07-15 WED: UNCHANGED (53rd check)
- 2026-07-14 TUE: UNCHANGED (47th check)
---
72nd check Mon 20 Jul 2026 UTC, 7th hourly

CONFIRMED UNCHANGED, fresh DB Mon 20 Jul.
4 orphan payments still present, booking_id = null:
- Payment 16988: EUR 339.90, HubSpot pmt ID 1204827374829, type one_time_or_initial, created 28 Apr 2026 -- unlinked 83 days
- Payment 16989: EUR 339.90, HubSpot pmt ID 1204846469317, type one_time_or_initial, created 28 Apr 2026 -- unlinked 83 days
- Payment 17187: EUR 6151, Fidelo 37587, transaction D2026226, created 5 May 2026 -- unlinked 76 days
- Payment 4781: EUR 380, Fidelo 32056, transaction D20191404, created 10 Apr 2026, payment date 2019 -- unlinked 101 days
Booking 17856 Margherita Galbusera: status CONFIRMED, confirmed = false, paid EUR 339.90/339.90
Booking 17857 Francesca Fassina: status CONFIRMED, confirmed = false, paid EUR 339.90/339.90
Stale booking courses: 24,436 active with end date before 20 Jul 2026.
Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC, 72nd check, hourly bot.

---
79th check Mon 20 Jul 2026 UTC (16th hourly)

CONFIRMED UNCHANGED (fresh DB Mon 20 Jul).
4 orphan payments still present (bookingId = null):
- Payment 16988: EUR 339.90, HubSpot payment ID 1204827374829, 28 Apr 2026 — 83 days unlinked
- Payment 16989: EUR 339.90, HubSpot payment ID 1204846469317, 28 Apr 2026 — 83 days unlinked
- Payment 17187: EUR 6151, TransferMate Escrow, 1 May 2026 — 80 days unlinked
- Payment 4781: EUR 380, Flywire, payment date 2019 — legacy migration gap
Booking 17856 (Margherita Galbusera): confirmed = false, paid EUR 339.90/339.90
Booking 17857 (Francesca Fassina): confirmed = false, paid EUR 339.90/339.90
Stale booking courses: 24,436 active with end date before 20 Jul 2026. Auto-deactivation still not running.
Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (79th check, 16th hourly).
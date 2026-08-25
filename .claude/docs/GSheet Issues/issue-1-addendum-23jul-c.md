Issue 1 addendum 23jul-c — Orphan payments + stale booking courses/accommodations
Addendum: 51st hourly check Thu 23 Jul 2026 UTC (143rd total)
Reporter: NM | Area: Cleanup | Sheet row 2

Symptom
4 payments with no booking ID. 24,436 booking courses and 11,175 booking accommodations active but past end date.

Root cause (confirmed this check — fresh DB)
Orphan payments (booking_id = null):
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 — 86 days orphaned, xeroPaymentId = null
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 — 86 days orphaned, xeroPaymentId = null
- Payment 17187: EUR 6,151.00, TransferMate Escrow, 1 May 2026 — 83 days orphaned, fideloPaymentId = 37587 — Fidelo-migrated, booking unknown
- Payment 4781: EUR 380.00, Flywire, Aug 2019 — fideloPaymentId = 32056 — permanently unresolvable legacy

Stale active records (unchanged):
- 24,436 booking courses with active = true and end_date < today
- 11,175 booking accommodations with active = true and end_date < today

Fix recipe (NOT YET RUN)
For payments 16988 + 16989 (EUR 339.90 each, Bank, 28 Apr 2026):
  Query bookings with amount ~EUR 679.80 or ~EUR 339.90 created around Apr 2026
  -> UPDATE payments SET booking_id = <correct_id> WHERE id IN (16988, 16989)

For payment 17187 (EUR 6,151, fideloPaymentId=37587):
  Check Fidelo export for payment 37587 to identify original booking
  -> UPDATE payments SET booking_id = <correct_id> WHERE id = 17187

For payment 4781 (EUR 380, Flywire, 2019):
  Legacy Fidelo record — no resolution. Mark as reconciled or archive with note.

For stale BCs (24,436 records):
  -> UPDATE booking_courses SET active = false WHERE active = true AND end_date < CURRENT_DATE
  Run in batches; verify no active class_assignments before bulk deactivating.

For stale BAs (11,175 records):
  -> UPDATE booking_accommodations SET active = false WHERE active = true AND end_date < CURRENT_DATE

Risk / category
money (payments 16988, 16989, 17187) | data-hygiene (stale BCs/BAs); partially reversible.
Bulk update touches 35,000+ records — run in batches with a backup first.

Status: OPEN — 4 orphan payments (86d, 86d, 83d, permanent); 24,436 stale BCs; 11,175 stale BAs
Last checked: Thu 23 Jul 2026 UTC (51st hourly / 143rd total)
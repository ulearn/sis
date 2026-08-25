Issue 1 — Orphan Payments + Stale Booking Courses (156th check)
Reporter: NM | Area: Cleanup | Sheet row: 2 | Checked: Wed 5 Aug 2026 UTC

SYMPTOM
Orphan payments with no booking link; stale BCs still active; bookings confirmed=false despite CONFIRMED status.

ROOT CAUSE — unchanged from 155th check

Orphan payments (4, all booking_id = null, xero_payment_id = null):
  16988: EUR 339.90, Bank, 28 Apr 2026 — 99 days orphaned
  16989: EUR 339.90, Bank, 28 Apr 2026 — 99 days orphaned
  17187: EUR 6,151, TransferMate Escrow (txn D2026226), 1 May 2026 — 96 days
  4781:  EUR 380, Flywire (txn D20191404), 20 Aug 2019 — legacy

Linked bookings (confirmed=false anomaly):
  Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amountPaid=EUR 339.90, no payment row
  Booking 17857 (Francesca Fassina):    CONFIRMED, confirmed=false, amountPaid=EUR 339.90, no payment row
  Payments 16988+16989 almost certainly belong to 17856+17857 (same amount, same date).

Stale booking courses (24,467 total):
  BC 25006 (Marina Larripa, General English AM Plus, ended 3 Aug 2026): active=true, 2d stale, 2 SCAs
  BC 24630 (Francesca Fassina, ended 10 Jul 2026): active=true, 26d stale, 0 SCAs
  BC 24631 (Margherita Galbusera, ended 10 Jul 2026): active=true, 26d stale, 0 SCAs

FIX RECIPE (NOT YET RUN)

Step 1 — Link orphan payments:
  p.payment.update({ where: { id: 16988 }, data: { bookingId: 17856 } })
  p.payment.update({ where: { id: 16989 }, data: { bookingId: 17857 } })

Step 2 — Fix confirmed=false:
  p.booking.updateMany({ where: { id: { in: [17856, 17857] } }, data: { confirmed: true } })

Step 3 — Deactivate stale BCs:
  p.bookingCourse.updateMany({ where: { id: { in: [25006, 24630, 24631] } }, data: { active: false } })

Step 4 — Payment 17187 (EUR 6,151 TM) + 4781 (EUR 380 Flywire 2019): Neil to identify booking or decide write-off.

RISK: money / data-hygiene. Reversible: yes. Blast radius: 2 bookings, 4 payments, 3 BCs.
STATUS: Open — fix NOT RUN. Last checked: Wed 5 Aug 2026 UTC (156th hourly run)
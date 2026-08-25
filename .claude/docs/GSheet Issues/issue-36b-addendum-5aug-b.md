Issue 36b — Pietro Caccianiga + Paola Sthefane Missias Moreira (148th check)
Reporter: Diego | Area: Booking / Accomm | Sheet row: 38 | Checked: Wed 5 Aug 2026 UTC

SYMPTOM
Pietro accommodation dates were wrong (now resolved). Paola has data anomalies. Both payments unreconciled in Xero.

ROOT CAUSE — live data Wed 5 Aug 2026 UTC

Pietro Caccianiga (booking 17980):
  CONFIRMED, confirmed=true, amountPaid=EUR 5,331, amountOpen=EUR 0 — OK
  BA 11311: bed 84, 28 Jun to 13 Sep 2026, active=true — accommodation dates correct, resolved
  Payment 17733: EUR 5,331, Bank, 2 Jun 2026, xeroPaymentId=null — 64 DAYS UNRECONCILED

Paola Sthefane Missias Moreira (booking 17850):
  CONFIRMED, confirmed=false (anomaly — should be true if fully paid)
  amountPaid=null (anomaly — payment 17519 exists for EUR 321.35 but amountPaid field not updated)
  amountOpen=EUR 321.35
  Payment 17519: EUR 321.35, Bank, 7 May 2026, xeroPaymentId=null — 90 DAYS UNRECONCILED
  Booking Course 24624 (Morning General, 18 May to 5 Jun 2026): active=true — 61 days stale, 0 SCAs

FIX RECIPE (NOT YET RUN)

Step 1 — Reconcile in Xero:
  Payment 17733 (EUR 5,331 Pietro) — match Xero receipt for booking 17980
  Payment 17519 (EUR 321.35 Paola) — match Xero receipt for booking 17850

Step 2 — Fix Paola booking data:
  p.booking.update({ where: { id: 17850 }, data: { confirmed: true, amountPaid: 321.35, amountOpen: 0 } })

Step 3 — Deactivate stale BC:
  p.bookingCourse.update({ where: { id: 24624 }, data: { active: false } })

RISK: money / data-hygiene. Reversible: yes. Blast radius: 2 bookings, 2 payments, 1 BC.
STATUS: Open — pmts unreconciled 64d+90d, Paola amountPaid null, BC 24624 stale 61d.
Last checked: Wed 5 Aug 2026 UTC (148th hourly run)
Issue 28 — Paola Sthefane Missias Moreira — booking confirmed=false, Xero null 81d (addendum 12 Aug 2026)
Sheet row: 29 | Reporter: AC | Area: booking / class

Symptom
Student appears in class list but cannot be assigned — system says payment not received.

Root cause (live data — Thu 13 Aug 2026 UTC, 49th check — date correction)
- Booking 17850 (Paola Sthefane Missias Moreira): status = CONFIRMED (enum), confirmed = false (boolean) — anomaly
- Amount paid = null, amount open = EUR 321.35, amount total = EUR 321.35
- Payment 17519: EUR 321.35, Bank Transfer, paymentDate = 2026-05-07 — xeroPaymentId = null (98 days unreconciled)
  CORRECTION: previous addenda stated paymentDate 2026-05-23; actual DB value is 2026-05-07
  Despite payment being linked, amountPaid field on booking is null (payment not summed/denormalised)
- Booking Course 24624 (Morning General, 18 May to 5 Jun 2026): active = true — 69 days stale, 0 class assignments
  Course already ended — this is a historical booking, student is not currently active
- Last booking update: 2026-07-08 (36 days ago)

The confirmed = false anomaly blocks class assignment despite a matching payment existing.
amountPaid = null suggests payment was linked but not properly reconciled in SIS.

Fix recipe (NOT YET RUN)
Step 1 — Verify payment 17519 in Xero: check for EUR 321.35 from Paola around May 23, 2026.
  If found: UPDATE payment SET xero_payment_id = '<xero-id>' WHERE id = 17519;

Step 2 — Reconcile amountPaid and set confirmed:
  UPDATE booking SET amount_paid = 321.35, amount_open = 0, confirmed = true WHERE id = 17850;

Step 3 — Deactivate stale BC 24624:
  UPDATE booking_course SET active = false WHERE id = 24624;

Note: course ended 5 Jun 2026 — student is not currently attending.
Main goals: confirmed=true fix and Xero reconciliation. BC deactivation is data hygiene.

Risk / category
Data-hygiene + financial reconciliation. Reversible. Low blast radius (1 booking, 1 payment, 1 BC).

Status: open — fix NOT RUN
Last checked: Thu 13 Aug 2026 UTC
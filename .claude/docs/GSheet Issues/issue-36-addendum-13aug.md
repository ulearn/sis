Issue 36 — Pietro Caccianiga (accommodation fee null + Xero unreconciled)

Reporter: Diego | Area: Booking / Accomm | Sheet row: 38 | Student ID: 14521

Symptom
Second accommodation period (Aug 22 – Sep 13) has fee = null. Check-in 9 days away (22 Aug 2026). Payment EUR 5,331 Xero unreconciled 72 days.

Root cause (live data — 177th check, Thu 13 Aug 2026 UTC)

- Booking 17980: CONFIRMED, confirmed = true, EUR 5,331 paid, EUR 0 open
- Booking Accommodation 11311: bed 84, Jun 28 to Aug 22 2026, fee = EUR 3,850, active — first stay ending Aug 22
- Booking Accommodation 11393: bed 88 (A2 / Room 3), Aug 22 to Sep 13 2026, fee = null, active — check-in 9 days
- Payment 17733: EUR 5,331, Bank, 2 Jun 2026, xeroPaymentId = null — Xero unreconciled 72 days
- Implicit BA 11393 fee = EUR 5,331 − EUR 3,850 = EUR 1,481 (must verify with Diego/accounts)

Fix recipe (NOT YET RUN)

Step 1 — Confirm BA 11393 fee with Diego/accounts (expected EUR 1,481)

Step 2 — Set fee on BA 11393
  NOT YET RUN
  UPDATE booking_accommodations SET fee = <CONFIRMED_FEE>, updated_at = NOW() WHERE id = 11393;
  Verify: SELECT id, bed_id, start_date, end_date, fee FROM booking_accommodations WHERE id = 11393;

Step 3 — Reconcile Payment 17733 in Xero (admin)
  EUR 5,331, Bank, 2 Jun 2026, booking 17980 — match against Xero invoice for Pietro Caccianiga.

Risk / category
- Category: bookings / money
- Reversible: yes
- Blast radius: single student
- Urgency: HIGH — check-in Aug 22 = 9 days away

Status
Open — fix NOT RUN as of 177th check Thu 13 Aug 2026 UTC. Fee null day 7.
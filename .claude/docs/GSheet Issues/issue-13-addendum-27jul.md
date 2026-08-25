# Issue 13 — Lizbeth del Carmen Sierra Martinez — Insurance Fee Null (Addendum 27 Jul 2026)
Reporter: AC | Area: Booking | Sheet row: 14

Status (36th check, Mon 27 Jul 2026 UTC): UNCHANGED — now 63 days unpriced

Evidence:
- Booking extra 96 (booking 17981): extra_type = INSURANCE, fee = null — created 25 May 2026, 63 days without a fee
- Booking 17981 (Lizbeth del Carmen Sierra Martinez): status = CONFIRMED, EUR 1,407.50 / 1,407.50 fully paid
- Booking 17981: confirmed = false — flag anomaly on a fully-paid confirmed booking (last updated 23 Jun 2026)
- Student enrolled approximately 57 school days without priced insurance record

Fix Recipe (NOT YET RUN):
Step 1 — Confirm insurance fee amount with Neil / finance.
Step 2 — Set fee (NOT YET RUN):
  UPDATE booking_extras SET fee = <confirmed_fee>, updated_at = NOW() WHERE id = 96;
Step 3 — Fix confirmed flag (NOT YET RUN):
  UPDATE Booking SET confirmed = true, updated_at = NOW() WHERE id = 17981;
Step 4 — Revoke and re-issue invoice for booking 17981 if fee affects total.

Risk: Medium (insurance gap, potential invoice re-issue). Reversible. Blast radius: single booking.
Status: OPEN. 36th check Mon 27 Jul 2026 UTC. Fee null 63d. Fix NOT RUN.

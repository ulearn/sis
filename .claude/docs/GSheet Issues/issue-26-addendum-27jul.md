# Issue 26 — Ivan Rodriguez / Ernesto Pesoa — Stale BCs + EUR 250 Outstanding (Addendum 27 Jul 2026)
Reporter: NM | Area: Booking / Class | Sheet row: 27

Status (41st check, Mon 27 Jul 2026 UTC, 27th hourly): UNCHANGED — staleness counters updated

Evidence:
- Booking course 23 (Ivan Rodriguez Solares, Intensive General 30, ended 22 May 2026): active = true — 66 days stale
- Booking course 24826 (Ernesto Pesoa Gil, Intensive General 30, ended 19 Jun 2026): active = true — 38 days stale
- Booking 18034 (Ernesto Pesoa Gil): PARTIAL status, confirmed = false, EUR 845 / 1,095 paid — EUR 250 outstanding
- Payment 17683 (EUR 845, booking 18034): xeroPaymentId = null — unreconciled in Xero

Fix Recipe (NOT YET RUN):
Step 1 — Deactivate stale booking courses:
  UPDATE BookingCourse SET active = false, updatedAt = NOW() WHERE id IN (23, 24826);
Step 2 — Chase EUR 250 balance from Ernesto Pesoa Gil / agency for booking 18034.
Step 3 — Reconcile payment 17683 in Xero, then backfill xeroPaymentId on Payment record.
Step 4 — Once paid in full: UPDATE Booking SET confirmed = true, updatedAt = NOW() WHERE id = 18034;

Risk: EUR 250 outstanding + Xero unreconciled — MEDIUM. Stale BCs cosmetic. Reversible.
Status: OPEN. 41st check Mon 27 Jul 2026 UTC. BC23 66d, BC24826 38d. EUR250 open. Fix NOT RUN.

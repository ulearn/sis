# Issue 30 — Giulia Avallone / Milena Vinci: Stale BC + Xero Lag (125th check, Wed 12 Aug 2026 UTC)
Reporter: AC | Area: Booking | Sheet row: 31

## Status
Unchanged from 124th check (Tue 11 Aug 2026). Xero lag now 152 + 194 days.

## Root Cause
- Booking Course 104 (Morning General Plus, booking 94): ended 2026-06-26 — 47 days stale, active = true, 1 class assignment (id 270)
- Caution: Booking Course 104 has 1 class assignment — verify it is historical before deactivating
- Booking 94 (Giulia Avallone, student 88): CONFIRMED, confirmed = true, EUR 1,151.50 fully paid, EUR 0 open
- Payment 17102: EUR 1,151.50, booking 94, paymentDate 13 Mar 2026 — xeroPaymentId = null (152 days unreconciled)
- Payment 945: EUR 4,231, booking 79 (Milena Vinci), paymentDate 30 Jan 2026 — xeroPaymentId = null (194 days unreconciled)
- Milena Vinci (parent) listed as student in SIS — separate data hygiene issue, lower priority

## Fix Recipe (NOT YET RUN)
Step 1 — Verify class assignment 270 on BC 104 is historical:
  SELECT sca.*, c.level, c.session FROM student_class_assignment sca JOIN class c ON c.id = sca.class_id WHERE sca.id = 270;
  Confirm weekEnd is in the past.

Step 2 — Deactivate stale Booking Course 104:
  UPDATE booking_course SET active = false WHERE id = 104;

Step 3 — Reconcile payments in Xero via Hub fins/:
  Payment 17102: EUR 1,151.50 on booking 94 (Giulia) — 152 days outstanding
  Payment 945: EUR 4,231 on booking 79 (Milena) — 194 days outstanding — PRIORITY

## Risk / Category
Data-hygiene + money (194d Xero lag on EUR 4,231). Reversible. Blast radius: 1 BC + 2 payments across 2 bookings. Medium-high urgency.

## Status: Open — fix NOT RUN.
## Last checked: 2026-08-12 UTC
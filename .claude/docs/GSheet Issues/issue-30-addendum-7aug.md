# Issue 30 — Giulia Avallone: Stale Booking Course + Xero (120th check, 7 Aug 2026)
Reporter: AC | Area: Booking | Sheet row: 31 | 120th hrly check Fri 7 Aug 2026 UTC

Root cause (verified Fri 7 Aug 2026 UTC):
- Booking 94 (Giulia Avallone, student 88): status=CONFIRMED, confirmed=true, EUR 1,151.50 fully paid
- Booking Course 104 (Morning General Plus, 15 Jun to 26 Jun 2026): active=true — 42 days stale
- Payment 17102: EUR 1,151.50, Bank, 13 Mar 2026, xero_payment_id=null — 147 days unreconciled

Fix recipe (NOT YET RUN):

Step 1 — Deactivate Booking Course 104:
  UPDATE booking_courses SET active=false WHERE id=104;

Step 2 — Reconcile payment 17102 in Xero:
  Match EUR 1,151.50 Bank Transfer (13 Mar 2026) to Xero invoice for booking 94.

Step 3 — Verify:
  SELECT active FROM booking_courses WHERE id=104;
  SELECT xero_payment_id FROM payments WHERE id=17102;

Risk: Data hygiene / accounts | Reversible | Low blast radius
Status: NOT RUN | Last checked: Fri 7 Aug 2026 UTC (120th check)
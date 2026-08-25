Issue 30 -- Giulia Avallone: BC104 Stale + Payment 17102 Xero Null

Reporter: Staff | Area: booking | Sheet row: 31

Symptom
Giulia Avallone / Milena Vinci booking cleanup. Booking course 104 ended Jun 26 but still active.
Payment 17102 not reconciled in Xero.

Root Cause (13 July 2026 UTC, 32nd check)
- Booking course 104 (Morning General Plus, 15 June to 26 June 2026):
    ended 26 June -- active = true still (17 days stale)
- Payment 17102 (EUR 1151.50, booking 94, Giulia Avallone, student 88):
    xeroPaymentId = null, type = null -- not reconciled in Xero
- Booking 94: Confirmed, EUR 1151.50 fully paid
- Both items UNCHANGED since first flagged

Fix Recipe (NOT YET RUN)
Step 1 -- Deactivate stale booking course:
  UPDATE booking_courses SET active = false WHERE id = 104;

Step 2 -- Xero reconciliation of payment 17102:
  In Xero: find the payment record for EUR 1151.50 (booking 94, Giulia Avallone)
  Update the SIS payment record with the Xero payment ID:
  UPDATE payments SET xero_payment_id = <xero_id>, type = CommerceHub (or correct type)
  WHERE id = 17102;
  (Or use the Xero sync UI/script if available)

Risk
Category: bookings + data-hygiene | Reversible: yes | Blast radius: low (1 booking, 1 payment)

Status: Open -- 32nd check 13 July 2026 UTC. Both items unchanged.

---
33rd check 2026-07-14 Tue UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 104 (Morning General Plus, 15-26 June 2026): active=still true (18 days stale since end date). Payment 17102 (EUR 1151.50, booking 94, Giulia Avallone s88): xeroPaymentId=still null, type=null. Both items unchanged for 18 days.
Fix NOT RUN.
Last checked: 2026-07-14 Tue UTC (33rd check, hourly bot).
**34th check Wed 15 Jul UTC: CONFIRMED UNCHANGED. BC104 Morning General Plus Jun15-Jun26 active=STILL true (19d stale, ended Jun26). Pmt17102 EUR1151.50 xeroPaymentId=STILL null. BK94 CONF EUR1151.50/1151.50. Fix NOT RUN. Last checked: 2026-07-15 UTC (34th check).**

---
**16 Jul 2026 UTC (35th check, fresh DB)**

CONFIRMED UNCHANGED. Booking course 104 (Morning General Plus, ended 26 June 2026): active=STILL true — 20 days stale. Payment 17102 (EUR1151.50, booking 94, Giulia Avallone s88): xeroPaymentId=STILL null, type=null. Booking 94 CONFIRMED EUR1151.50/1151.50.

Fix (NOT YET RUN):
1. UPDATE booking_courses SET active = false WHERE id = 104;
2. Reconcile payment 17102 EUR1151.50 in Xero.
Last checked: 2026-07-16 UTC (35th check, hourly bot).
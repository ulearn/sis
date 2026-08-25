# Issue 48 — Telmuun Enkhsaikhan (student 293) | 150th check Thu 20 Aug 2026 UTC

Sheet row 50 | Reporter: AC | Area: Attendance/Classes

## DB-verified state (150th — no change from 149th)

Booking 1624: PARTIAL, confirmed = false
  Paid EUR 1,406 | Open EUR 250 | Total EUR 1,656
  Only 1 payment in DB: id=17956, EUR 100, 31 Mar 2026, xeroPaymentId = null
  EUR 1,306 payment gap — unresolved
Booking Course 1810 (AY Renewal Morning, 29 Jun – 1 Jan 2027, active):
  0 class assignments (confirmed by DB query this run) — day 52 of active course

## Fix recipe (NOT YET RUN)

Step 1: SELECT id, amount, "paymentDate", method, "xeroPaymentId" FROM "Payment" WHERE "bookingId" = 1624;
Step 2: Check Hub fins/ for TM/Xero payments matching student 293 / booking 1624
  ssh hub@localhost; cd /home/hub/web/hub.ulearnschool.com/public_html/fins/
Step 3 (after payment resolved): INSERT SCA into BC 1810 for student 293 with correct classId
Step 4: UPDATE "Booking" SET confirmed = true, "amountOpen" = 0 WHERE id = 1624;

Risk: medium (money reconciliation first). Reversible.
Status: No change. 150th check Thu 20 Aug 2026 UTC. BC1810 0 SCAs day 52.
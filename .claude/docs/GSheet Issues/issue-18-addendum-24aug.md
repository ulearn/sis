# Issue 18 — Flavia Nascimento Mariano — Visa Null + Xero Unreconciled — 41st check

Reporter: TB | Area: Visa | Sheet row 19

## Root cause (confirmed Mon 24 Aug 2026 UTC)
- Student 983 (Flavia Nascimento Mariano): visa_status = null, last updated 2026-08-19
- Booking 1534: CONFIRMED, confirmed = true, amount paid EUR 1,308, amount open EUR 0 (fully paid)
- Payment 17035: EUR 250, Bank Transfer, xero_payment_id = null
- Payment 17527: EUR 1,058, Bank, xero_payment_id = null
  (Payments sum to EUR 1,308 = amountPaid — correct; only Xero reconciliation missing)
- Booking Course 1710 (Academic Year Afternoon): ends 2026-11-27, active = true — student in school now
- Documents: doc 210 (template 1): ISSUED | doc 212 (template 83): ISSUED | doc 117: REVOKED
- No change from 40th check (Sun 23 Aug).

## Fix recipe (NOT YET RUN)
Step 1: Verify visa approval in HubSpot deal, then:
  UPDATE students SET visa_status = 'Approved' WHERE id = 983;
Step 2: Find EUR 250 in Xero, get ID -> UPDATE payments SET xero_payment_id = '<XeroId1>' WHERE id = 17035;
Step 3: Find EUR 1,058 in Xero, get ID -> UPDATE payments SET xero_payment_id = '<XeroId2>' WHERE id = 17527;

## Risk
Data-hygiene. Reversible. Blast radius: student 983 only.

## Status
OPEN — Fix NOT RUN. Visa null, active student through Nov 2026. Both payments xero_payment_id = null.
Last checked: 2026-08-24 UTC (495th run, 41st issue check)

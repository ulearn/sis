Issue 25 — Uyanga Tungalag (138th check, 4th today)

Reporter: pg | Area: Visa / Class | Sheet row: 26

Symptom: Visa status not selectable via UI; student not appearing in class-to-be-assigned.

Root cause (confirmed Sun 2 Aug 2026 UTC):
- Student 917 (Uyanga Tungalag): visa_status = null, hubspot_contact_id = null
- BC 1613 (AY Morning, 27 Apr to 30 Oct 2026): active, 0 SCAs — 97 days since course start
- Booking 1467: CONFIRMED, confirmed = true, amount_paid = EUR 2405, amount_open = EUR 0
- Payment 17258: EUR 3066 TransferMate Escrow, xero_payment_id = null
- EUR 661 discrepancy: payment 17258 is EUR 3066 but booking amount_paid shows EUR 2405
  Possible explanation: agency fee deducted by TransferMate
- No class assignment ever created for this student (Day 97)

Fix recipe (NOT YET RUN):

Step 1 — Set visa_status to Approved for student 917:
  SQL: UPDATE students SET visa_status = 'Approved' WHERE id = 917;
  (UI save fails; direct SQL required)

Step 2 — Backfill hubspot_contact_id for student 917:
  Search HubSpot for Uyanga Tungalag and get contact ID
  UPDATE students SET hubspot_contact_id = <id> WHERE id = 917;

Step 3 — Create SCA on BC 1613:
  Via SIS admin: Classes > Assign > Uyanga Tungalag > current week (Mon 3 Aug)
  Class: confirm with Adriana/Paul which level Uyanga is in

Step 4 — Investigate EUR 661 discrepancy on payment 17258:
  Check TransferMate/HubSpot for this transaction (EUR 3066 received vs EUR 2405 on booking)
  If agency fee: update booking amount or create a payment_instalment record

Step 5 — Reconcile payment 17258 in Xero:
  Link xero_payment_id once TransferMate reconciliation is confirmed

Risk: Visa + Classes; low blast radius (1 student). Steps 1+2 reversible.

Status: Fix NOT RUN — 138th check, 4th today Sun 2 Aug 2026 UTC (Day 97, no SCA ever)
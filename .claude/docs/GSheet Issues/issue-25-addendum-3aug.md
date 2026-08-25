# Issue 25 — Uyanga Tungalag (139th check, 1st today)
Reporter: PG | Area: Visa / Class | Sheet row: 26

Symptom: Visa status not selectable via UI; student not appearing in class-to-be-assigned.

Root cause (Mon 3 Aug 2026 UTC, Day 98 without class assignment):
- Student 917 (Uyanga Tungalag): visa_status = null, hubspot_contact_id = null
- BC 1613 (AY Morning, 27 Apr to 30 Oct 2026): active, 0 SCAs — 98 days since course start
- Booking 1467: CONFIRMED, confirmed = true, amount_paid = EUR 2,405, amount_open = EUR 0
- Payment 17258: EUR 3,066 TransferMate Escrow, paid 8 May 2026, xero_payment_id = null (87 days unreconciled)
- EUR 661 discrepancy: payment 17258 = EUR 3,066 but booking.amount_paid = EUR 2,405 — likely agency fee deducted by TransferMate
- State unchanged from yesterday (issue-25-addendum-2aug-c.md)

Fix recipe (NOT YET RUN):

Step 1 — Set visa_status to Approved for student 917:
  UPDATE students SET visa_status = 'Approved' WHERE id = 917;
  (UI save fails; direct SQL required)

Step 2 — Backfill hubspot_contact_id for student 917:
  Search HubSpot for Uyanga Tungalag and get contact ID
  UPDATE students SET hubspot_contact_id = <id> WHERE id = 917;

Step 3 — Create SCA on BC 1613:
  Via SIS admin: Classes > Assign > Uyanga Tungalag > current week (Mon 3 Aug)
  Class: confirm with Adriana/Paul which level Uyanga is in

Step 4 — Investigate EUR 661 discrepancy on payment 17258:
  Check TransferMate statement for transaction D2025502
  Determine if EUR 661 is agency deduction or error
  Reconcile booking amount_paid if adjustment needed

Risk/category: Visa + Classes + Finance; blast radius = 1 student. All steps reversible.
Status: NOT RUN — 139th check, 1st today Mon 3 Aug 2026 UTC
Last checked: Mon 3 Aug 2026 UTC
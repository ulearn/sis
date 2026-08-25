Issue 25 -- Uyanga Tungalag (addendum 30 Jul 2026)

Reporter: AC | Area: Visa / Class | Sheet row: 26

Symptom
Visa status not selectable -- student not appearing in class to be assigned.

Root cause (Thu 30 Jul 2026 UTC)
- Student 917 (Uyanga Tungalag): visaStatus = null, hubspotContactId = null
- Last student update: 2026-07-28 09:38 UTC (bulk touch -- no data change)
- Booking 1467: status = CONFIRMED, confirmed = true, amountOpen = EUR 0, amountPaid = EUR 2405
- Payment 17258: EUR 3066, TransferMate Escrow, 2025-10-20, xeroPaymentId = null
  Note: payment amount (3066) exceeds booking amountPaid (2405) -- discrepancy to investigate
- Booking course 1613 (Academic Year Morning, 2026-04-27 to 2026-10-30): active = true, zero class assignments
- 94 calendar days into 187-day Academic Year with no class record

Fix recipe (NOT YET RUN)

Step 1 -- Find and link HubSpot contact:
  Search HubSpot for Uyanga Tungalag
  UPDATE student SET hubspot_contact_id = (found_id) WHERE id = 917;

Step 2 -- Set visa status (after verifying from HubSpot deal):
  UPDATE student SET visa_status = APPROVED WHERE id = 917;

Step 3 -- Assign to Morning class:
  SIS admin > booking 1467 > booking course 1613 > assign class

Step 4 -- Investigate payment discrepancy:
  Payment 17258 = EUR 3066 but booking amountPaid = EUR 2405
  Check Hub/Xero for actual total; reconcile xeroPaymentId on payment 17258

Risk: bookings + class assignment -- student possibly attending 94 days with no class record. Reversible; medium priority.

Status: UNCHANGED. 94 days into AY, zero SCAs, no HubSpot link, no visa status.
Last checked: Thu 30 Jul 2026 UTC
# Issue 25 Addendum 30jul-c (130th check Thu 30 Jul 2026 UTC)

Reporter: PG | Sheet row: 26

Fresh DB check:
- Student 917 (Uyanga Tungalag): visaStatus=null, hubspotContactId=null, updatedAt=2026-07-28.
- Booking 1467: CONFIRMED, confirmed=true, amountPaid=EUR 2405, amountOpen=EUR 0.
- BC 1613 (AY Morning, Apr 27-Oct 30 2026): active=true. 0 class assignments. 94 days into course.
- Payment 17258: EUR 3066 TransferMate Escrow (D2025502), xeroId=null. EUR 661 excess vs booking total.
- No change from 30jul-b.

Fix (see 30jul-b for full SQL):
Step 1: Find HubSpot contactId for Uyanga, UPDATE students SET hubspot_contact_id=<ID> WHERE id=917.
Step 2: UPDATE students SET visa_status=APPROVED WHERE id=917 (confirm with staff first).
Step 3: INSERT student_class_assignments (1613, <class_id>, ...) for BC 1613.
Step 4: Investigate EUR 661 overpayment via TransferMate/Xero (deal D2025502, xeroId=null).

Status: NOT RUN. 130th check Thu 30 Jul 2026. 94 days / 0 class assignments.

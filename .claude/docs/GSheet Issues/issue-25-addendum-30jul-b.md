## Issue 25 — Uyanga Tungalag: Visa Null, No Class, HubSpot Unlinked
Reporter: PG | Sheet row: 26

## Root cause (Thu 30 Jul 2026 UTC — 129th check)
• Student 917: visaStatus=null, hubspotContactId=null, updatedAt=2026-07-28
• Booking 1467: CONFIRMED confirmed=true amountPaid=2405 amountOpen=0 amountTotal=2405
• BC1613: AY Morning, 2026-04-27 to 2026-10-30, active=true, 0 SCAs (never assigned)
• Payment 17258: EUR 3,066 TransferMate Escrow D2025502 paymentDate=2025-10-20 xeroId=null
• Discrepancy: EUR 3,066 paid vs amountTotal EUR 2,405 (EUR 661 overpayment)

## Fix recipe — NOT YET RUN

Step 1 — Link HubSpot contact:
Search HubSpot for Uyanga Tungalag, get contactId
UPDATE students SET hubspot_contact_id = <ID> WHERE id = 917;

Step 2 — Set visa status:
UPDATE students SET visa_status = APPROVED WHERE id = 917;
(Confirm status with staff based on nationality)

Step 3 — Assign to Morning class (UI or manual SCA):
INSERT INTO student_class_assignments (booking_course_id, class_group_id, active, start_date)
VALUES (1613, <CLASS_ID>, true, 2026-04-27);

Step 4 — Investigate EUR 661 overpayment:
Deal D2025502, receipt R20253818, fidelo 36936
Check Xero/TransferMate: was EUR 3,066 a combined payment split across 2 bookings?
xeroPaymentId=null — payment not reconciled in Xero

## Risk
Visa/class — reversible; EUR 661 financial discrepancy (low blast radius); 1 student

## Status
Fix NOT RUN. 94 days into AY; 0 SCAs; visaStatus null; hubspotContactId null.
EUR 661 overpayment unresolved. xeroId null.
Last checked: Thu 30 Jul 2026 UTC (129th check)
Issue 25 Uyanga Tungalag Visa + SCA + Payment Reconciliation
Reporter: pg Row 26 Check 137th (3rd today Sun 2 Aug UTC)

Root Cause (137th check 02 Aug 2026):
- Student 917 (Uyanga Tungalag): visaStatus=null hubspotContactId=null.
- BK 1467: CONFIRMED confirmed=true amountPaid=EUR 2405 amountOpen=EUR 0.
- Payment 17258: EUR 3066 TransferMate Escrow xeroPaymentId=null. EUR 661 discrepancy (3066 vs 2405 paid). Possible agency fee.
- BC 1613 (Academic Year Morning Apr 27-Oct 30 2026): active=true 0 SCAs 97 days since course start.

Fix Recipe (NOT YET RUN):
1. Set visa (confirm approved): UPDATE students SET visa_status=approved WHERE id=917;
2. Link HubSpot (search CRM Uyanga Tungalag): UPDATE students SET hubspot_contact_id=<id> WHERE id=917;
3. Investigate EUR 661: is 3066 gross including agency fee? If yes no action. If no record refund or adjust amount.
4. Reconcile pmt 17258 in Xero: match EUR 3066 TransferMate to BK 1467 invoice. Update xero_payment_id.
5. Create SCA BC 1613 (OVERDUE 97 days): INSERT INTO student_class_assignments (booking_course_id, class_id, week_start) VALUES (1613, <class_id>, <week>);

Risk: Visa + money + bookings. Reversible. 1 student. Escalate 137 checks 97 days without class.

Status: UNRESOLVED Fix NOT RUN
Last checked: 2026-08-02 UTC
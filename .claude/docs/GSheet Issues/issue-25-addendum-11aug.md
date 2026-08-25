Issue 25 - Uyanga Tungalag (addendum 11 Aug 2026)
Sheet row: 26 | Booking 1467 | Student 917 | Area: Visa / Class

Live data (Tue 11 Aug 2026 UTC - 156th check, day 106)
- Student 917 (Uyanga Tungalag): visaStatus=null; visa dates set (27 Apr to 28 Dec 2026); hubspotContactId=null; last updated 28 Jul 2026 (14 days ago)
- Booking 1467: CONFIRMED, confirmed=true, amountPaid=EUR 2,405, amountOpen=EUR 0, service_end 30 Oct 2026
- Booking Course 1613 (Academic Year Morning, 27 Apr to 30 Oct 2026): active=true - 0 class assignments across 106 days
- Payment 17258: EUR 3,066 (8 May 2026) - xeroPaymentId=null (95 days unreconciled); EUR 661 over booking total

Root cause
Three gaps: (1) visaStatus=null prevents to-be-assigned list from showing student; (2) hubspotContactId=null means no CRM link; (3) 0 SCAs despite 106 days active. Payment discrepancy EUR 3,066 vs booking EUR 2,405 - likely TransferMate batch covering multiple students.

Fix recipe (NOT YET RUN)
1. Investigate payment 17258 discrepancy (EUR 3,066 vs booking EUR 2,405):
   SELECT * FROM payment WHERE id=17258;
   Check TransferMate records in Hub fins/ for D-number reference

2. Set visa_status:
   UPDATE student SET visa_status='approved' WHERE id=917;

3. Link HubSpot contact:
   Search HubSpot for Uyanga Tungalag, get contact ID:
   UPDATE student SET hubspot_contact_id=ID WHERE id=917;

4. Assign BC 1613 to AY Morning class in SIS admin

5. Reconcile payment 17258 in Xero via Hub fins/

Risk
Bookings | Money (payment discrepancy) | Data-hygiene. Student 106 days active with 0 attendance - urgent. Blast radius = 1 student.

Last checked: Tue 11 Aug 2026 UTC
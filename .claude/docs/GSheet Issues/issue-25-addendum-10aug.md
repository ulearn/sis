# Issue 25 — Uyanga Tungalag (addendum 10 Aug 2026)
Sheet row: 26 | Booking 1467 | Student 917 | Area: Visa / Class

## Live data (Mon 10 Aug 2026 UTC — 154th check, day 105)
- Student 917: visaStatus=null; visa dates set (27 Apr to 28 Dec 2026); hubspotContactId=null; last updated 28 Jul 2026 (13 days ago)
- Booking 1467: CONFIRMED, confirmed=true, amountPaid=EUR 2,405, amountOpen=EUR 0, svcEnd 30 Oct 2026
- Payment 17258: EUR 3,066 (8 May 2026) xeroPaymentId=null — 94 days unreconciled
- NOTE: booking amountPaid=EUR 2,405 but payment 17258 amount=EUR 3,066 — discrepancy of EUR 661 to investigate
- BC 1613 (AY Morning, 27 Apr to 30 Oct 2026): active=true, 0 class assignments — student never in class after 105 days

## Root cause
Student is fully paid (booking confirms EUR 0 open) but three gaps remain: (1) visaStatus null prevents UI approval; (2) hubspotContactId null means no CRM link; (3) 0 class assignments despite 105 days active. This is the longest-standing unassigned student on the sheet. Payment discrepancy (EUR 3,066 vs EUR 2,405) needs investigation — may be a TransferMate payment covering multiple students.

## Fix recipe (NOT YET RUN)
1. Investigate payment 17258 (EUR 3,066 vs amountPaid EUR 2,405):
   SELECT * FROM payment WHERE id=17258;
   Check TransferMate records in Hub fins/ for reference D-number

2. Set visa_status on student 917:
   UPDATE student SET visa_status=approved, updated_at=NOW() WHERE id=917;

3. Link HubSpot contact:
   Search HubSpot for Uyanga Tungalag, get contact ID, then:
   UPDATE student SET hubspot_contact_id=ID WHERE id=917;

4. Assign BC 1613 to AY Morning class in SIS admin

5. Reconcile payment 17258 in Xero via Hub fins/

## Risk
Bookings | Money (payment discrepancy) | Data-hygiene. Student is 105 days in with 0 attendance — urgent to assign to class.

Last checked: Mon 10 Aug 2026 UTC
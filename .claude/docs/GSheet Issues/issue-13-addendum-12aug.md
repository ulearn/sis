# Issue 13 — Lizbeth del Carmen Sierra Martinez: Insurance + Visa + Confirmed Anomaly (51st check, Wed 12 Aug 2026 UTC)
Reporter: ST | Area: Booking | Sheet row: 14

## Status
Unchanged from 50th check (Tue 11 Aug 2026). Day 72 in course.

## Root Cause
Three data-entry gaps — no system error:
1. Insurance dates (medicalFrom, medicalUntil) never entered on student 14522
2. visaStatus = null despite visaFrom 1 Jun 2026 and visaUntil 1 Feb 2027 being set
3. Booking 17981: confirmed = false despite payment 17520 (EUR 1,407.50) being linked
- Booking Course 24773 (Academic Year Afternoon, 1 Jun 2026 to 29 Jan 2027): active, 1 class assignment — student is in class
- Payment 17520: EUR 1,407.50, paymentDate 22 May 2026 — xeroPaymentId = null (82 days unreconciled)

## Fix Recipe (NOT YET RUN)
Step 1 — Obtain insurance dates from agent or HubSpot deal, then update via SIS Admin or:
  UPDATE student SET medical_from='YYYY-MM-DD', medical_until='YYYY-MM-DD' WHERE id = 14522;

Step 2 — Set visa status approved:
  UPDATE student SET visa_status='approved' WHERE id = 14522;
  (Or via SIS Admin > Student 14522 > Visa tab)

Step 3 — Set booking confirmed = true:
  UPDATE booking SET confirmed = true WHERE id = 17981;

Step 4 — Reconcile payment 17520 (EUR 1,407.50) in Xero via Hub fins/.

## Risk / Category
Data-hygiene | bookings | money. Reversible. Student is in class — no urgency beyond missing insurance record and Xero reconciliation.

## Status: Open — fix NOT RUN.
## Last checked: 2026-08-12 UTC
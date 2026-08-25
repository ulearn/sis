# Issue 20 — Ariunsarnai Batbayar payment pending — Addendum 21 Jul 2026 (32nd hrly)

Reporter: PG | Area: Booking / Class | Sheet row: 21

CORRECTION (32nd hourly): Prior H column entries mis-reported amountTotal as null.
This was a field-name error -- the Booking model has no 'total' field; correct field
is 'amountTotal'. The total has been EUR 1509 since at least 23 Jun 2026 (updatedAt).

Root cause (45th check, Tue 21 Jul 2026 UTC):

Booking 1605 (Ariunsarnai Batbayar, student 1047):
- Status: PENDING, confirmed = false
- Day 99 since booking created 13 Apr 2026
- amountTotal: EUR 1509; amountOpen: EUR 1509; amount paid: EUR 0 -- fully unpaid
- Zero payments on file
- Booking last updated 23 Jun 2026 -- 28 days with no activity
- Booking course 1791: Academic Year Renewal Morning, 13 Apr to 23 Oct 2026, active=true
- HubSpot deal 502951083215 -- enrolment decision still needed

Fix recipe (NOT YET RUN):
1. Open HubSpot deal 502951083215 -- check deal stage (Won / stalled / lost?)
2. If proceeding: advance deal to Won, collect payment, booking will auto-confirm
3. If not proceeding: cancel booking 1605 in SIS (Admin > Booking > Status > Cancelled),
   update HubSpot deal 502951083215 to Lost with reason

Risk: bookings; reversible. Blast radius: one student.
Status: OPEN -- Fix NOT RUN.
Last checked: Tue 21 Jul 2026 UTC (32nd hourly, 45th check)

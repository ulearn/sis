# Issue 20 — Ariunsarnai Batbayar (check Fri 24 Jul 2026 UTC, 48th hourly, 149th total)

Reporter: staff. Area: Booking / Class. Sheet row 21.

## Symptom
Not appearing in class assignment list; system says payment due.

## Root Cause (UNCHANGED)
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status = PENDING, confirmed = false — Day 102
- Amount paid: EUR 0; amount total: EUR 1,509 — no payments received in SIS
- Booking course 1791 (Academic Year Renewal Morning, 13 Apr to 23 Oct 2026): active = true
- Last database update: 23 Jun 2026 (31 days ago)
- Student has been attending since 13 Apr but booking is unconfirmed and unpaid

## Fix Recipe (NOT YET RUN)
1. Check HubSpot deal for student 1047 (Ariunsarnai Batbayar) for payment status:
   - Is there a HubSpot payment recorded?
   - What does the deal show for amount paid?
2. If payment exists in HubSpot/Xero but not in SIS:
   - Create a payment record in SIS for booking 1605
   - Set amountPaid to EUR 1,509
3. If payment genuinely not received:
   - Chase payment from student/agency
   - Decide whether to confirm booking before payment (school policy)
4. Once payment is confirmed: update booking 1605 status = CONFIRMED, confirmed = true
5. Create class assignment for booking course 1791 (AY Renewal Morning)

## Risk / Category
- Category: bookings / payments / class assignment
- Reversible: yes
- Blast radius: student 1047 only

## Status
Fix NOT RUN as of Fri 24 Jul 2026 UTC (48th hourly check, 149th total). Day 102 since booking start (Apr 13). Booking 1605 still PENDING, EUR 0 paid.
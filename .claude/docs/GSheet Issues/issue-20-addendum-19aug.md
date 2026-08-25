# Issue 20 -- Ariunsarnai Batbayar: PENDING booking, no class assignment (58th check, Wed 19 Aug 2026)

Reporter: AC | Area: Booking | Sheet row: 21

## Symptom
Not appearing in class-to-be-assigned list; says payment due.

## Root cause -- verified 19 Aug 2026
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status = PENDING, confirmed = false
- Amount paid = EUR 0, amount open = EUR 1,509 -- no payments linked in SIS
- Booking Course 1791 (Academic Year Renewal Morning, Apr 13 to Oct 23 2026): active = true, 0 class assignments
- Day 128 since course start (Apr 13 2026)
- 64 days until course end (Oct 23 2026)

## Fix recipe (NOT YET RUN)
Step 1: Verify payment status via HubSpot deal and/or Xero invoice for booking 1605.
Step 2a (if paid): UPDATE booking SET confirmed = true, amount_paid = <actual>, amount_open = 0 WHERE id = 1605;
Step 2b (if paid): Assign student to class via SIS class assignment UI.
Step 3 (if not paid): Contact student/agency for payment.
Step 4 verify: SELECT status, confirmed, amount_paid, amount_open FROM booking WHERE id = 1605;

## Risk
Category: bookings + money | Reversible: yes | Blast radius: 1 student
Student has been without a class since Apr 13 (128 days). Course ends Oct 23 (64 days left).

## Status
Open. EUR 1,509 unconfirmed. Day 128. 64d to course end. Fix NOT RUN.
Last checked: Wed 19 Aug 2026 UTC (58th check)

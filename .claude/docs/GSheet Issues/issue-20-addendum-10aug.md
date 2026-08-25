# Issue 20 — Ariunsarnai Batbayar (addendum 10 Aug 2026)
Sheet row: 21 | Booking 1605 | Student 1047 | Area: Booking / Class

## Live data (Mon 10 Aug 2026 UTC — 43rd check, day 119)
- Booking 1605: PENDING, confirmed=false, amountPaid=EUR 0, amountOpen=EUR 1,509
- No payments linked — booking last updated 23 Jun 2026 (48 days ago)
- BC 1791 (AY Renewal Morning, 13 Apr to 23 Oct 2026): active=true, 0 class assignments
- Student has never been assigned to a class in 119 days

## Root cause
EUR 1,509 fee completely unpaid. No payment has ever been linked to this booking. Booking is PENDING and student has 0 class assignments across 119 days. The last update (Jun 23) suggests this was noticed before but not resolved.

## Fix recipe (NOT YET RUN)
Step 1 — Check HubSpot deal for student 1047 (Ariunsarnai Batbayar) for any payment evidence.

Step 2a — If payment found (link and confirm):
   INSERT INTO payment (booking_id, amount, payment_method, created_at, updated_at)
   VALUES (1605, [amount], [method], [date], NOW());
   UPDATE booking SET confirmed=true, amount_paid=[amount], amount_open=0, status=CONFIRMED WHERE id=1605;

Step 2b — If no payment (contact student):
   Email Ariunsarnai Batbayar re EUR 1,509 outstanding.
   Consider cancelling booking if student is not attending.

Step 3 — After payment resolved: assign BC 1791 to AY Morning class in SIS admin.

## Risk
Money — EUR 1,509 outstanding 119 days. Decision needed before any DB action.

Last checked: Mon 10 Aug 2026 UTC
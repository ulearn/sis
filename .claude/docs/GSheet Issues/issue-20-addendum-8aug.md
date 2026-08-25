Issue 20 - Ariunsarnai Batbayar: EUR 1509 Unpaid - Day 118 (40th check, Sat 8 Aug 2026 UTC)

Reporter: (booking) | Area: Booking / Class | Sheet row: 21

SYMPTOM: Booking 1605 PENDING, confirmed=false, EUR 1509 outstanding, 0 payments - day 118 since course start.

ROOT CAUSE (live 2026-08-08 UTC):
  Booking 1605 (Ariunsarnai Batbayar, student 1047): PENDING, confirmed=false
  amountTotal=EUR 1509, amountPaid=EUR 0 - 0 payment records ever linked
  Booking Course 1791 (Academic Year Renewal Morning, 2026-04-13 to 2026-10-23): active=true
  Course start: 13 Apr 2026 - day 118 today; last booking update: 2026-06-23 (46 days ago)
  serviceEnd: 2026-10-23
  No payments have ever been linked. Student attending 118 days with zero payment recorded.

FIX RECIPE (NOT YET RUN):
  Step 1: Check HubSpot deal for Ariunsarnai Batbayar (student 1047) for any payment / TransferMate / Xero entry.
  Step 2: If payment found - create Payment record linked to booking 1605, set confirmed=true.
  Step 3: If no payment - contact student/agent immediately; EUR 1509 is 118 days overdue.
  Step 4: If cancel: UPDATE Booking SET status=CANCELLED, confirmed=false WHERE id=1605;
           UPDATE BookingCourse SET active=false WHERE id=1791;

RISK: Money (EUR 1509 outstanding 118 days) - escalation recommended.
Status: OPEN - Fix NOT RUN
Last checked: 2026-08-08 UTC (40th hourly check)
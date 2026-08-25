Issue 20 -- Ariunsarnai Batbayar (student 1047, booking 1605)
Reporter: PG | Area: Booking/Class | Row: 21 | 55th check Sun 16 Aug 2026 UTC
No change from 54th check.

Booking 1605: PENDING, confirmed=false, amountTotal=EUR 1509, amountPaid=EUR 0
  serviceStart: 2026-04-13 | serviceEnd: 2026-10-23
  Day 125 since course start. EUR 1509 outstanding. 68 days to course end (Oct 23).

BC 1791 (Academic Year Renewal Morning, Apr 13-Oct 23 2026): active=true, 0 SCAs.
Payments: 0 in SIS. HubSpot unavailable (headless run).

FIX RECIPE (NOT YET RUN)
Step 1: Check HubSpot for payment of EUR 1509 (student 1047, Ariunsarnai Batbayar).
Step 2a (if paid): UPDATE bookings SET confirmed=true, amount_paid=1509 WHERE id=1605;
  Then assign BC 1791 to Academic Year Morning class via SIS admin.
Step 2b (if not paid): Chase student/agent for EUR 1509 -- day 125, escalate.

Risk: Financial | Do NOT confirm without verifying payment | Blast radius: 1 student
Status: Fix NOT RUN. Day 125/193. EUR 1509 open. Last checked: Sun 16 Aug 2026 UTC.

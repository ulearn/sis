Issue 20 -- Ariunsarnai Batbayar (Day 112; EUR 0 / EUR 1509 unpaid; PENDING)
Reporter: PG | Area: Booking/Class | Sheet row 21

Root Cause (13th check, 1st this hour -- Sun 2 Aug 2026 UTC)
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status=PENDING, confirmed=false, amount_paid=EUR 0.
- BC 1791: Academic Year Renewal Morning, started Apr 13 2026, active, 0 SCAs.
- Day 112 since course start. No payment, no SCA. Amount open: EUR 1509.

Fix Recipe (NOT YET RUN)

Step 1 -- Chase payment (112 days overdue)
Contact agent/student regarding EUR 1509 outstanding. Escalate if no response.

Step 2 -- Decision point
If payment confirmed:
  UPDATE bookings SET confirmed=true, updated_at=NOW() WHERE id=1605;
  Then create SCA on BC 1791 from week Aug 4 via SIS admin.
If no payment: cancel booking 1605 (status='CANCELLED') and deactivate BC 1791.

Risk: Financial + Bookings. Reversible. 1 student. EUR 1509 at risk.
Status: NOT RUN. Last checked: Sun 2 Aug 2026 UTC (13th check, 3rd today)
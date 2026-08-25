# Issue 20 — Ariunsarnai Batbayar: Unpaid Pending Booking (Addendum 25 Jul 2026 B)

Reporter: PG | Area: Booking / Class | Sheet row: 21 | Check: 50th hourly, 165th total

STATUS: Unchanged — booking 1605 PENDING, EUR 0 paid, Day 103.

CURRENT DATA (fresh query Sat 25 Jul UTC):
- Booking 1605 (Ariunsarnai Batbayar, student 1047): status = PENDING, confirmed = false
- Day 103 since 13 Apr 2026 | Last DB update: 23 Jun 2026 (32 days ago)
- Amount paid: EUR 0 | Amount total: EUR 1,509 | Payments linked: 0
- Booking course 1791 (Academic Year Renewal Morning, 13 Apr - 23 Oct 2026): active = true

FIX RECIPE (NOT YET RUN):
Option A — Confirm booking (if payment resolved outside SIS):
  SIS admin: Bookings > 1605 > Confirm, then record EUR 1,509 payment
Option B — Cancel booking (if no payment expected):
  SIS admin: Bookings > 1605 > Cancel | Deactivate booking course 1791

Risk: bookings / payments | Reversible: partially | Single student
Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (50th hourly, 165th total)
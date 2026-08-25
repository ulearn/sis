# Issue 20 — Ariunsarnai Batbayar: Booking Pending, No Payment (Addendum 25 Jul 2026)

Reporter: Staff | Area: Booking / Class | Sheet row: 21 | Check: 49th hourly, 164th total

STATUS: Open — Day 103. EUR 0 / 1,509. 0 payments. Booking PENDING since 13 Apr 2026.

CURRENT DATA (fresh query Sat 25 Jul UTC):
- Booking 1605 (student 1047, Ariunsarnai Batbayar): status = PENDING, confirmed = false
- Amount paid: EUR 0 | Amount total: EUR 1,509 — no payments received at all
- Last database update: 23 Jun 2026 — 32 days ago (was 31 days yesterday)
- Booking course BC 1791 (Academic Year Renewal Morning, 13 Apr - 23 Oct 2026): active = true
- Day 103 since booking created 13 Apr 2026 (was Day 102 in yesterday's check)
- 0 payments linked to booking 1605

FIX RECIPE (NOT YET RUN):

Option A — Chase payment and confirm booking (if student intends to stay):
  1. Contact student/agent for EUR 1,509
  2. Once paid: set booking 1605 status = CONFIRMED/PARTIAL, confirmed = true
  3. Assign BC 1791 to appropriate Morning class from current week

Option B — Cancel booking (if student departed or payment not forthcoming):
  In SIS admin: Bookings > 1605 > Cancel
  Or SQL (NOT YET RUN):
  UPDATE bookings SET status = 'CANCELLED', confirmed = false WHERE id = 1605;
  UPDATE booking_courses SET active = false WHERE booking_id = 1605;

RISK: Money (EUR 1,509 outstanding 103 days) | Bookings (unconfirmed course active) | Reversible: Yes

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (49th hourly, 164th total)

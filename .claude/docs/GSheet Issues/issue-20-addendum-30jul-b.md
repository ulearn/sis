# Issue 20 — Ariunsarnai Batbayar — EUR 1,509 Unpaid (Day 117)
Reporter: Staff  |  Area: Booking / Class  |  Sheet row: 21

## Symptom
Not appearing in class-to-be-assigned; system says payment due.

## Current state (Thu 30 Jul 2026 UTC) — UNCHANGED
- Student 1047 (Ariunsarnai Batbayar)
- Booking 1605: PENDING, confirmed = false
- Amount total EUR 1,509 / Amount paid EUR 0 / Amount open EUR 1,509
- Zero payments in SIS — no payment ever received
- BC 1791: Apr 13 to Oct 23 2026, active = true (course running 117+ days unpaid)

## Root cause
No payment has been made or recorded. Booking remains PENDING with full EUR 1,509 outstanding.
confirmed = false blocks class assignment. Course has been active since Apr 13 with no revenue.

## Fix recipe (NOT YET RUN)

### Option A — chase payment (preferred)
1. Check HubSpot deal associated with booking 1605 for payment status / agency notes
2. Contact student or agency to collect EUR 1,509
3. Once paid, add payment in SIS: Booking 1605 -> Add Payment
4. After amountOpen = 0, confirm the booking (set confirmed = true)

### Option B — cancel if student will not pay
  UPDATE bookings SET status='CANCELLED' WHERE id=1605;
  UPDATE booking_courses SET active=false WHERE id=1791;
Only run if confirmed with Neil that student is not paying and not attending.

## Information needed from Neil
- Is this student currently attending classes despite EUR 0 paid?
- Is there an agency or payment plan in HubSpot for booking 1605?
- Cancel or continue pursuing payment?

## Risk / category
- Category: money — EUR 1,509 at risk
- 117 days of potential tuition unpaid
- Reversible: add payment is easy; cancellation harder to undo

## Status
OPEN — EUR 1,509 unpaid, day 117+, no change
Last checked: Thu 30 Jul 2026 UTC
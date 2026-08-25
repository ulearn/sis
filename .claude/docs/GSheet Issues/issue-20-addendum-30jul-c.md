## Issue 20 — Ariunsarnai Batbayar: EUR 0 / 1,509 Pending
Reporter: PG | Area: Booking / Class | Sheet row: 21

## Root cause (Thu 30 Jul 2026 UTC)
- Booking 1605: PENDING, confirmed=false
- amountPaid = EUR 0 / amountTotal = EUR 1,509 — zero payments ever received
- BC1791: AY Renewal Morning, 2026-04-13 to 2026-10-23, active=true
- Day 108 from course start (Apr 13 to Jul 30)
- No payments in DB at all

## Fix recipe — NOT YET RUN

### Option A: Chase payment via HubSpot deal 1605
1. Open HubSpot, search Ariunsarnai Batbayar
2. Chase payment; once received, confirm booking in SIS

### Option B: Cancel if no payment coming
UPDATE bookings SET status = CANCELLED, confirmed = false WHERE id = 1605;
UPDATE booking_courses SET active = false WHERE id = 1791;

## Risk
Financial — EUR 1,509 outstanding 108+ days; no payment trace in DB
Student cannot be assigned to class until confirmed=true

## Status
Fix NOT RUN. Day 108; EUR 0 paid. HubSpot chase needed.
Last checked: Thu 30 Jul 2026 UTC
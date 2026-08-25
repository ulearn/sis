# Issue 20 --- Ariunsarnai Batbayar --- Booking PENDING, Day 101, EUR 0 Paid
Reporter: PG | Area: Booking / Class | Sheet Row 21

## Root Cause (46th hourly check, Thu 23 Jul 2026 UTC --- 145th total)
- Booking 1605 (student 1047 - Ariunsarnai Batbayar): status = PENDING, confirmed = false
- amountTotal = EUR 1,509; amountPaid = EUR 0 --- zero payments received
- Booking course 1791: Academic Year Renewal Morning, 13 Apr - 23 Oct 2026, active = true
- Last DB update: 23 Jun 2026 (30 days ago; 101 days since course start)

Status: DATA UNCHANGED. No payment in 101 days.

## Fix Recipe (NOT YET RUN)

Option A - Chase payment and confirm booking:
  UPDATE bookings SET status = CONFIRMED, confirmed = true, confirmed_at = NOW()
  WHERE id = 1605; -- NOT YET RUN

Option B - Cancel:
  UPDATE bookings SET status = CANCELLED WHERE id = 1605; -- NOT YET RUN
  UPDATE booking_courses SET active = false WHERE booking_id = 1605; -- NOT YET RUN

## Risk
- money (EUR 1,509 outstanding), bookings; reversible; 1 booking

## Status
OPEN --- Day 101, no change. Fix NOT RUN.
Last checked: Thu 23 Jul 2026 UTC (46th hourly, 145th total)
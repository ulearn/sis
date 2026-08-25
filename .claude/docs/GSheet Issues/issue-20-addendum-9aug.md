# Issue 20 Addendum 9 Aug
Reporter: Staff | Row: 21 | Check: 42nd Sun 9 Aug 2026 UTC

## Symptom
Student not appearing in class-to-be-assigned — payment due shown.

## Root Cause — unchanged
- Booking 1605 (Ariunsarnai Batbayar, student 1047): PENDING, confirmed = false
- Amount paid = EUR 0, open = EUR 1,509, total = EUR 1,509 — fully unpaid, 0 payment records
- Booking Course 1791 (Academic Year Renewal Morning): active = true, 0 class assignments
- Day 118 since course start (13 Apr 2026)
- HubSpot contact ID 780356561119

## Fix Recipe (NOT YET RUN)
Option A — if payment found in HubSpot:
  Step 1: Link payment to booking 1605 in SIS admin.
  Step 2: UPDATE bookings SET confirmed = true, amount_paid = <amount>, amount_open = 0 WHERE id = 1605;
  Step 3: Assign BC 1791 to class via SIS admin.

Option B — no payment:
  Contact student/agency re EUR 1,509. Decide to hold or cancel bk 1605.

## Risk: Bookings / payments. Reversible. 1 student.
## Status: Open. NOT RUN. Day 118. 0 payments on record.
## Last Checked: Sun 9 Aug 2026 UTC (42nd check)
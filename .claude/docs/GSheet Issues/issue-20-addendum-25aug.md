# Issue 20 — Ariunsarnai Batbayar — Payment Due / No Payments — 472nd check

Reporter: AC | Area: Booking / Class | Sheet row 21

## Symptom
Student not appearing in class-to-be-assigned list; SIS shows payment due.

## Root cause (confirmed Tue 25 Aug 2026 UTC)
- Student 1047 (Ariunsarnai Batbayar): visaStatus = null, visaUntil = 14 Dec 2026
- Booking 1605: PENDING, confirmed = false, amount paid = EUR 0, amount total = EUR 1,509 — 0 payments on record
- Booking Course 1791 (Academic Year Renewal Morning): active = true, ends 23 Oct 2026 — 59 days remaining; no class assignment
- Day 134. Unchanged from 471st check (Mon 24 Aug).

## Fix recipe (NOT YET RUN)
Step 1: Verify EUR 1,509 payment in Xero and/or HubSpot (deal for student 1047).
Step 2: If payment found, enter payment record in SIS against booking 1605.
Step 3: SET confirmed = true on booking 1605 once payment entered.
Step 4: Add Student Class Assignment to Booking Course 1791 for the appropriate class.

## Risk
Bookings / money. Reversible. Blast radius: 1 student, 1 booking. Urgency: Booking Course 1791 ends 23 Oct (59 days).

## Status
OPEN — Day 134. PENDING, 0 payments. Booking Course ends in 59 days with no class assignment. Fix NOT RUN.
Last checked: 2026-08-25 UTC (517th run, 472nd issue check)
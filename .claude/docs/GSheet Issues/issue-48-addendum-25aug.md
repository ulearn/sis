# Issue 48 — Telmuun Enkhsaikhan + Others — Payment Gap / No SCA — 492nd check

Reporter: AC | Area: Attendance / Classes | Sheet row 50

## Symptom
Multiple students with class assignment or payment issues (Uyanga, Ana Jessica, Telmuun, Ariunsarnai, Saikhantes, Enshi Lu).

## Root cause (confirmed Tue 25 Aug 2026 UTC — Telmuun focus)
- Booking 1624 (Telmuun Enkhsaikhan): PARTIAL, confirmed = false
- Amount paid = EUR 1,406, amount total = EUR 1,656, open = EUR 250
- Payment records in DB: only Payment 17956 (EUR 100, Bank, 29 Jun 2026, xeroPaymentId = null)
- Gap: amountPaid field shows EUR 1,406 but only EUR 100 in payment table — EUR 1,306 unaccounted
- Booking Course 1810: active = true, ends 1 Jan 2027 — 0 class assignments (active future course)
- Day 57 since issue logged. Unchanged from 491st check (Mon 24 Aug).

## Fix recipe (NOT YET RUN)
Step 1: Search Xero and HubSpot for EUR 1,306 payment against Telmuun Enkhsaikhan / booking 1624.
Step 2: If found, create missing payment record(s) in SIS to reconcile amountPaid field with actual payments.
Step 3: Reconcile Payment 17956 (EUR 100) in Xero.
Step 4: Add Student Class Assignment to Booking Course 1810 for the appropriate class.

## Risk
Money / bookings. Reversible. Blast radius: 1 student, 1 booking.

## Status
OPEN — EUR 1,306 gap between booking amountPaid and actual payment records. Booking Course 1810 active with 0 class assignments. Fix NOT RUN.
Last checked: 2026-08-25 UTC (517th run, 492nd issue check)
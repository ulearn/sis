# Issue 13 — Lizbeth del Carmen (insurance fee null)
Reporter: AC | Area: Booking | Sheet row 14

## Current state — 38th check Wed 29 Jul 2026 UTC
Unchanged from 28 Jul:
- Booking extra 96 (booking 17981): extra_type = INSURANCE, fee = null — 65 days unpriced
- Booking extra 95 (booking 17981): extra_type = EXAM_FEE, fee = 220 (OK)
- Booking 17981: EUR 1407.50 paid, status Confirmed, last updated 25 May 2026
- Insurance cost not tracked in Xero; booking amount_open likely understated

## Fix recipe (NOT YET RUN)
1. Confirm correct insurance amount with accounts and agency (World2Go Limited).
2. Set fee on booking extra 96 via SIS admin or DB:
   p.bookingExtra.update(id=96, fee=AMOUNT)
3. Verify Xero reflects the charge.

Full context in: issue-13-lizbeth-health-insurance.md

## Risk
- Category: bookings / money | Reversible: Yes | Blast radius: 1 student

## Status
Open — fix NOT run. Insurance fee null for 65 days.
Last checked: Wed 29 Jul 2026 UTC

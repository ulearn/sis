# Issue 27 — Sofiia Korkishchenko (BK17909 cancelled/confirmed=true) | Addendum 28 Jul 2026

Reporter: AC | Area: Booking | Sheet row: 28

## Symptom
Old course ending day new course starts — creates duplicate booking confusion.

## Root Cause
Booking 17909 is CANCELLED but confirmed=true (anomaly). BC 24693 still active=true.

Evidence (28 Jul 2026 UTC):
- Booking 17909: status=CANCELLED, confirmed=true, amountOpen=EUR727.50, amountPaid=EUR0
- Last updated 17 Jun 2026 — 41 days stale
- BC 24693 (Renewal - Academic Year PM, 25 May – 13 Nov 2026): active=true
- Void deadline: 25 Oct 2026 (89 days remaining)

## Fix Recipe (NOT YET RUN)
Step 1 — Fix booking anomaly:
UPDATE Booking SET confirmed = false WHERE id = 17909;

Step 2 — Deactivate stale BC:
UPDATE BookingCourse SET active = false WHERE id = 24693;

## Risk
Category: data-hygiene. Reversible: yes. Blast radius: booking 17909 + BC 24693 only.

## Status
Unchanged — BK17909 CANCELLED confirmed=true (41d). Fix NOT RUN.
Last checked: 28 Jul 2026 UTC
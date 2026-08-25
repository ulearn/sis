# Issue 7 — Sofiia Korkishchenko Cancelled Booking (58 days)
Reporter: AC | Area: Booking | Sheet row: 8

## Root Cause (verified 16:02 UTC Thu 6 Aug 2026)
- Booking 17909 (student 768, Sofiia Korkishchenko): status=CANCELLED, confirmed=true (anomaly).
- amount_total=EUR 727.50, amount_paid=EUR 0, amount_open=EUR 727.50 — fully unpaid.
- 0 payments linked to this cancelled booking.
- Last updated 2026-06-17 — 50 days ago.
- Student has active booking 17849 (BC 24623 AY Renewal Afternoon, Jun 8 to Nov 27 2026) — enrollment OK.

## Fix Recipe (NOT YET RUN)
Set booking 17909 confirmed=false:
  UPDATE bookings SET confirmed=false, updated_at=NOW() WHERE id=17909;
Deactivate orphaned booking course 24693 (if still active):
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=24693;
Confirm EUR 727.50 open amount can be safely zeroed (no real payment ever made):
  UPDATE bookings SET amount_open=0, updated_at=NOW() WHERE id=17909;

## Status
Fix NOT RUN. 58 days open. Last checked: 16:02 UTC Thu 6 Aug 2026
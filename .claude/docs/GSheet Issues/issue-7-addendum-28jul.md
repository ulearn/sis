# Issue 7 — Booking 17909 Anomaly (Addendum 28 Jul 2026)
Reporter: ST. Sheet row 8. Last checked: Tue 28 Jul 2026 UTC (15th dedicated check).

## Symptom
Booking 17909 is CANCELLED but confirmed=true; BC 24693 still active.

## Root cause (fresh Tue 28 Jul 2026)
- Booking 17909 (Sofiia Korkishchenko, student 768): CANCELLED, confirmed=true
- Last updated 17 Jun 2026 — 41 days stale
- amount_open=EUR 727.50, amount_paid=0 — no payments on this booking
- BC 24693 (Renewal - Academic Year PM, 25 May-13 Nov 2026): active=true
See also: Issue 27 (same booking, different aspect).

## Fix recipe (NOT YET RUN)
1. Set confirmed=false: UPDATE bookings SET confirmed=false, updated_at=NOW() WHERE id=17909;
2. Deactivate BC: UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=24693;
3. Verify EUR 727.50 amount_open with Accounts before zeroing.

## Risk
Data hygiene. Low risk. Reversible. No financial impact (zero payments). Previous: issue-7-addendum-26jul.md.
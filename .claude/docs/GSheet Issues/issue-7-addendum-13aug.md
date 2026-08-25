# Issue 7 — Sofiia Korkishchenko: bk17909 CANCELLED + confirmed (41st check, Thu 13 Aug 2026)

Reporter: AC | Area: Booking | Sheet row 8

## Symptom
Booking 17909 is CANCELLED but confirmed=true.

## Root cause (live data, 13 Aug 2026 UTC)
- Booking 17909 (student 768, Sofiia Korkishchenko): status = CANCELLED, confirmed = true (anomaly)
- Amount paid = EUR 0, amount open = EUR 727.50 - no payment records
- Last updated 2026-06-17 (57 days ago)
- Booking Course 24693 (Renewal - Academic Year PM, ends 13 Nov 2026): active = true on a CANCELLED booking, 0 class assignments
- Student correctly enrolled on booking 17849 / Booking Course 24623 - no current student impact
- Same anomaly tracked under Issue 27 (row 28)

66 days open. No change from 40th check (Wed 12 Aug).

## Fix recipe - NOT YET RUN
```sql
-- 1: Set confirmed = false on cancelled booking
UPDATE booking SET confirmed = false WHERE id = 17909;

-- 2: Deactivate stale Booking Course 24693
UPDATE booking_course SET active = false WHERE id = 24693;
```

## Risk / category
Bookings / data-hygiene - reversible. Blast radius: 1 booking, 1 BC.

## Status
Open - 66 days. Fix NOT RUN. **Last checked:** 2026-08-13 UTC
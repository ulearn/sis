# Issue 41 addendum 23jul-f — Giampaolo Russo: Capel apt missing, Xero null, check-in 10d
Addendum: 65th hourly check Thu 23 Jul 2026 UTC (142nd total)
Reporter: KC | Area: Booking / Accomm | Sheet row 43

## Symptom
Giampaolo Russo booked host family + Capel Street apartment; Capel booking cannot be added to SIS.

## Root cause (confirmed this check — fresh DB)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, fully paid EUR 2,584.96
- Booking accommodation 11357: bed 178, Aug 2 to Sep 6 2026, active = true (host family — correct)
- Capel Street accommodation (Sep 6 to Sep 14, 1 week + 1 extra night): NOT present in booking 18180
- Payment 17954: EUR 2,584.96, xeroPaymentId = null — Xero not yet reconciled
- Check-in date Aug 2 = 10 days away
- No change from previous check (64th hourly, 141st total)

## Fix recipe (NOT YET RUN)
Step 1 — Add Capel Street accommodation to booking 18180:
  SIS Admin -> Student 14571 (Giampaolo Russo) -> Booking 18180 -> Accommodation
  -> Add accommodation: Capel Street apartment, Sep 6 2026 to Sep 14 2026

Step 2 — Confirm Xero reconciliation for payment 17954 (EUR 2,584.96):
  Xero -> find payment matching EUR 2,584.96 -> link xeroPaymentId in SIS

## Risk / category
bookings / accommodation; reversible. Single student. Check-in Aug 2 (10 days).
Capel Street booking needed before check-in for allocation.

## Status: OPEN — check-in Aug 2 in 10 days
Last checked: Thu 23 Jul 2026 UTC (65th hourly / 142nd total)

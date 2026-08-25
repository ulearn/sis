Issue 41 addendum 23jul-c — Giampaolo Russo: Capel accomm missing + Xero null (10d to check-in)
Addendum: 61st hourly check Thu 23 Jul 2026 UTC (111th total)
Reporter: KC | Area: Booking / Accomm | Sheet row 43

Symptom
Student booked host family + Capel Street apartment; Capel accommodation not in SIS. Xero payment unreconciled.

Root cause (confirmed this check)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, fully paid EUR 2,584.96
- Host family: booking accommodation 11357, bed 178, Aug 2 - Sep 6 2026, active = true (correct)
- Capel Street (Sep 6-14 2026): ABSENT — no booking accommodation record
- Payment 17954: EUR 2,584.96, Bank, 26 Jun 2026 — xeroPaymentId = null (27 days)
- HubSpot payment ID: 1268783973563
- Check-in Aug 2 = 10 days away

Fix recipe (NOT YET RUN)
Step 1 — Add Capel accommodation to booking 18180:
  SIS Admin -> Student 14571 -> Booking 18180 -> Accommodation -> Add
  Type: Capel Street (apartment/premium)
  Start: 2026-09-06  End: 2026-09-14
  Assign appropriate bed in Capel Street property

Step 2 — Reconcile payment 17954 with Xero:
  Fins/Xero -> locate EUR 2,584.96 bank payment 26 Jun 2026 from Giampaolo Russo
  Match to invoice for booking 18180
  Update xeroPaymentId on payment 17954 in SIS

Risk / category
bookings / accommodation / accounts; reversible. Check-in Aug 2 = 10 days.

Status: OPEN — check-in Aug 2 2026 (10 days)
Last checked: Thu 23 Jul 2026 UTC (61st hourly / 111th total)

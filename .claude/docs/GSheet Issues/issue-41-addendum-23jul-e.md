# Issue 41 addendum 23jul-e — Giampaolo Russo: Capel missing, check-in 10 days
Addendum: 63rd hourly check Thu 23 Jul 2026 UTC (140th total)
Reporter: KC | Area: Booking / Accomm | Sheet row 43

## Symptom
Student booked host family + Capel Street apartment; Capel not in SIS. Check-in Aug 2.

## Root cause (confirmed this check — fresh DB)
- Booking 18180 (Giampaolo Russo, student 14571): confirmed = true, fully paid EUR 2,584.96 / 2,584.96
- Host family accommodation: booking accommodation 11357, bed 178, Aug 2 to Sep 6 2026, active = true (correct)
- Capel Street apartment (Sep 6-14 2026): STILL ABSENT from booking accommodations — only 1 accommodation record exists
- Course BC24956: General English AM, Aug 3 to Sep 11 2026, 0 class assignments (course is future; not urgent yet)
- Payment 17954: EUR 2,584.96, hubspotPaymentId = 1268783973563, xeroPaymentId = null in DB
- Xero reconciliation: xeroPaymentId null — unverified via Hub (Prisma client field absent from generated client; raw SQL or Hub/Xero API needed)
- Check-in: Aug 2 (10 calendar days away)

## Fix recipe (NOT YET RUN)
Step 1 — Add Capel accommodation to booking 18180:
  SIS Admin -> Student 14571 (Giampaolo Russo) -> Booking 18180 -> Accommodation -> Add
  Type: Capel Street (premium / apartment)
  Start: 2026-09-06  End: 2026-09-14  (8 nights = 1 week + 1 night as per agreement)
  Assign appropriate Capel Street bed

Step 2 — Verify Xero reconciliation:
  ssh hub@localhost
  Check fins/ Xero records for EUR 2,584.96 from deal 507548635366
  If xeroPaymentId null and payment not matched: reconcile in Xero manually

Step 3 — Check class assignment before Aug 3 start:
  Assign BC24956 to appropriate General English AM class for Aug 3 start

## Risk / category
bookings / accommodation / accounts; reversible. Check-in Aug 2 = 10 days.
Capel bed assignment is time-sensitive — needs a bed allocated before student arrives Sep 6.

## Status: OPEN — check-in Aug 2 2026 (10 days); Capel apt still missing
Last checked: Thu 23 Jul 2026 UTC (63rd hourly / 140th total)

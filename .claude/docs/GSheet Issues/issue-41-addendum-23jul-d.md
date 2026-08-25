# Issue 41 addendum 23jul-d — Giampaolo Russo: Capel missing + 10d to check-in
Addendum: 62nd hourly check Thu 23 Jul 2026 UTC (137th total)
Reporter: KC | Area: Booking / Accomm | Sheet row 43

## Symptom
Student booked host family + Capel Street apartment; Capel not in SIS. Check-in Aug 2 (10 days).

## Root cause (confirmed this check)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, fully paid EUR 2,584.96
- Host family accommodation: BA11357, bed 178, Aug 2 to Sep 6 2026, active = true (correct)
- Capel Street apartment Sep 6-14 2026: STILL ABSENT from booking accommodations
- Course BC24956: General English AM, Aug 3 to Sep 11 2026, 0 class assignments (future course, not urgent yet)
- Payment 17954: EUR 2,584.96, hubspotPaymentId = 1268783973563
- Xero reconciliation status: unverifiable via Prisma client (xeroPaymentId field not in current generated client despite being in schema — DB may or may not be null; check via Hub/Xero API)
- HubSpot deal ID: 507548635366
- Check-in: Aug 2 (10 days away)
- Booking last updated Jun 29 2026 (24 days ago)

## Fix recipe (NOT YET RUN)
Step 1 — Add Capel accommodation to booking 18180:
  SIS Admin -> Student 14571 -> Booking 18180 -> Accommodation -> Add
  Type: Capel Street (apartment/premium)
  Start: 2026-09-06  End: 2026-09-14
  Assign appropriate bed in Capel Street property

Step 2 — Check Xero reconciliation:
  ssh hub@localhost
  Check fins/ Xero records for EUR 2,584.96 payment for deal 507548635366
  If not in Xero: match bank payment (Jun 26 2026) to invoice for booking 18180
  If xeroPaymentId is null in DB: update via SIS admin or direct SQL

## Schema note
The Prisma client in dist/generated/prisma/client does not expose xeroPaymentId on Payment model even though prisma/schema.prisma declares it. Client regeneration is needed (npx prisma generate) before xeroPaymentId can be queried via Prisma. Raw SQL or Hub/Xero API is required for Xero status.

## Risk / category
bookings / accommodation / accounts; reversible. Check-in Aug 2 = 10 days. Capel is time-sensitive.

## Status: OPEN — check-in Aug 2 2026 (10 days)
Last checked: Thu 23 Jul 2026 UTC (62nd hourly / 137th total)

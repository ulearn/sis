Issue 41 addendum 23jul-b — Giampaolo Russo: Capel Street missing + Xero null (10d to check-in)
Addendum: 59th hourly check Thu 23 Jul 2026 UTC (109th total)
Reporter: KC | Area: Booking / Accomm | Sheet row 43

Symptom
Capel Street apartment missing from booking; one payment not reconciled with Xero. Check-in Aug 2.

Root cause (confirmed this check)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, EUR 2,584.96 fully paid
- Accommodations: 1 only — BA11357, bed 178, 2 Aug - 6 Sep 2026 (host family correct)
- Capel Street apartment (6 Sep - 14 Sep 2026): STILL NOT IN SIS
- BC24956 General English AM, 3 Aug - 11 Sep 2026, active = true
- Payment 17954: EUR 2,584.96, Bank, 26 Jun, xeroPaymentId = null (24 days since created 29 Jun)
- hubspotPaymentId: 1268783973563
- Check-in: Aug 2 (10 days away)

Fix recipe (NOT YET RUN)
1. Add Capel St accommodation: SIS Admin -> Bk18180 -> Accommodations -> Add
   Start: 2026-09-06  End: 2026-09-14  Type: Apartment (Capel Street)
2. Reconcile pmt 17954: match HubSpot payment 1268783973563 to Xero invoice for bk18180
See full recipe: issue-41-giampaolo-dual-accomm.md

Risk / category
bookings / money; reversible. Blast radius: single student, check-in Aug 2 (10 days).

Status: OPEN — 10 days to check-in (Aug 2)
Last checked: Thu 23 Jul 2026 UTC (59th hourly / 109th total)
# Issue 25 — Uyanga Tungalag (student 917) — Visa Null + Zero SCAs (90 Days)

Reporter: NM | Area: Booking / Class | Sheet row: 26

## Root cause (verified Sun 26 Jul 2026 UTC)
- Student 917: visaStatus=null, 66 days since last update (May 21 2026)
- Student 917: hubspotContactId=null — cannot auto-verify visa
- BK1467: CONFIRMED, EUR 2405/2405 paid, confirmed=true
- BC1613 (AY Morning, Apr 27-Oct 30 2026): active, 0 SCAs — 90 days since course start

## Fix recipe (NOT YET RUN)
1. Confirm visa approval with student/agency
2. Set visaStatus: UPDATE student SET visaStatus='APPROVED' WHERE id=917
3. If HubSpot contact found: UPDATE student SET hubspotContactId=<id> WHERE id=917
4. Assign student to AY Morning class (BC1613) in SIS Classes view

## Risk
Bookings — AY Morning EUR 2405, unassigned 90 days. Academic impact.

## Status
UNRESOLVED — Visa null 66 days. Zero SCAs 90 days since course start.

Last checked: Sun 26 Jul 2026 UTC (87th check for issue 25)
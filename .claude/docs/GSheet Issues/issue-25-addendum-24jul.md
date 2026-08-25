# Issue 25 — Uyanga Tungalag — Visa Null, Zero Class Assignments (88 Days)
Reporter: NM | Area: Visa / Class | Sheet row: 26

## Root Cause (Fri 24 Jul 2026 UTC — 85th check — UNCHANGED)
- Student 917 (Uyanga Tungalag): visaStatus=null — 64 days since last update (21 May 2026)
- Student 917: hubspotContactId=null — cannot auto-verify from HubSpot
- Booking 1467: CONFIRMED, EUR 2405/2405 paid, confirmed=true
- Booking course 1613 (Academic Year Morning, 27 Apr to 30 Oct 2026): active, 0 class assignments — 88 days since course start

## Fix (NOT YET RUN)
1. SIS admin: Student 917 -> set visaStatus to Approved
2. Assign to AY Morning class: Booking 1467 -> BC 1613 -> Assign to Class
3. Optional: UPDATE Student SET hubspotContactId=<id>, updatedAt=NOW() WHERE id=917

## Risk: Student unassigned 88 days — HIGH impact. Reversible.
## Status: UNCHANGED — visaStatus null 64d, 0 SCAs 88d. Fix NOT RUN. Fri 24 Jul 2026 UTC

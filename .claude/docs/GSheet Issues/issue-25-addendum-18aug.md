# Issue 25 Addendum — Uyanga Tungalag — 18 Aug 2026

**Sheet row:** 26 | **Area:** Visa / Class

## Change since 17 Aug
- amountOpen closed: Booking 1467 amountOpen was EUR 661 on Mon 17 Aug; now EUR 0.
- confirmed = true on Booking 1467 (was false).
- Payment gap resolved — Xero reconciled or manual adjustment.
- Root cause unchanged: Student 917 visaStatus = null, hubspotContactId = null (updatedAt 28 Jul 2026).

## Current state (18 Aug 2026)
- Student 917 (Uyanga Tungalag): visaStatus = null, hubspotContactId = null
- Booking 1467: CONFIRMED, confirmed = true, amountPaid = EUR 2,405, amountOpen = EUR 0
- 0 student class assignments — still unassigned in class-to-be-assigned list
- Day 113 in course

## Fix recipe (NOT YET RUN)

Step 1: Set student 917 visaStatus = approved (SIS admin UI or DB).
Step 2: Assign to AY Morning class via SIS Classes UI.
Step 3: Link hubspotContactId if Uyanga has a HubSpot contact.

## Risk
- Category: Visa / Class assignment
- Reversible: Yes — blast radius: low (student 917 only)

## Status
OPEN — payment gap resolved but visa null, 0 SCAs. Fix NOT RUN.
Last checked: 2026-08-18 UTC (165th hourly check)
# Issue 15 — Saikhantes Shagdarsuren (new class assignment needed on return)
Reporter: Staff | Area: Booking / Class | Sheet row 16

## CORRECTION from previous checks
Prior H column stated "week dates null in DB" for SCA 255 — INCORRECT.
Actual DB values: weekStart = 12 Jan 2026, weekEnd = 3 Jul 2026.
SCA 255 is expired (ended 3 Jul 2026), not missing dates.

## Current state — 128th check Wed 29 Jul 2026 UTC
- Student 1001 (Saikhantes Shagdarsuren): on holiday 20 Jul-21 Aug 2026, returns Mon 24 Aug
- Booking course 24925 (Academic Year Afternoon, 9 Mar-2 Oct 2026): active = true
- Only SCA: SCA 255, class 11, weekStart 12 Jan, weekEnd 3 Jul 2026 — expired 26 days ago
- No active class assignment for the period 24 Aug-2 Oct 2026

## Fix recipe (NOT YET RUN)
ACTION DATE: Mon 24 Aug 2026 (when student returns from holiday)

Via SIS admin:
  1. Navigate to student 1001 (Saikhantes Shagdarsuren).
  2. Add class assignment for BC 24925 to class 11.
  3. Set period: Mon 24 Aug 2026 to Fri 2 Oct 2026 (BC 24925 end date).

Do NOT create SCA before Aug 24 — student is on authorised holiday until Aug 21.

## Risk
- Category: bookings | Reversible: Yes | Blast radius: 1 student, no financial impact

## Status
Open — action needed Mon 24 Aug 2026.
Last checked: Wed 29 Jul 2026 UTC

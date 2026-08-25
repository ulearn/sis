# Issue 45 — Renewal Students No Class Assignment (Addendum 21 Jul, run l)
Reporter: AC | Area: Renewal Students | Sheet row 47 | 35th hourly check (64th total) Tue 21 Jul 2026 UTC

## Symptom
Returning students with confirmed booking courses not appearing on arrivals/class list; zero class assignments.

## Current Status (fresh DB, no change from run k at 18:15)

BC 24828 | Martina Tartaro (14441) | bk18036 | Morning General Plus + IELTS Easter Promo | 5 May - 24 Jul 2026 | 0 SCAs | 3 days left — ENDS FRIDAY
BC 25011 | Eduardo (bk18233) | General English PM | 20 Jul - 24 Jul 2026 | 0 SCAs | 3 days left — ENDS FRIDAY (started yesterday)
BC 24609 | Xuezhen Huang (14443) | bk17831 | Morning General | 13 Jul - 31 Jul 2026 | 0 SCAs | 10 days left
BC 24991 | Edite Nunes (1015) | bk18214 | General English AM | 13 Jul - 7 Aug 2026 | 0 SCAs | 17 days left

BC25011 started Mon 20 Jul — 1 school day missed. Ends Fri 24 Jul.
BC24828 (Martina): full 12-week course with 0 class assignments throughout, ends Friday.

## Fix Recipe (NOT YET RUN)
Assign each booking course to the appropriate class via SIS class admin:
1. BC24828 -> Morning General Plus (appropriate level) — URGENT ends Fri 24 Jul
2. BC25011 -> General English PM class — URGENT ends Fri 24 Jul
3. BC24609 -> Morning General class — ends 31 Jul
4. BC24991 -> General English AM class — ends 7 Aug

## Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes
- Blast radius: 4 students with untracked class attendance for full course periods

## Status
OPEN — 35th hourly check, no fix run yet.
Last checked: 2026-07-21 UTC
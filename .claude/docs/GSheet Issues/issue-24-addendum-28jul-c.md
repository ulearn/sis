# Issue 24 — Alberto Squillace — 139th check Tue 28 Jul 2026 UTC

**Reporter:** ST | **Area:** Booking / Class | **Sheet row:** 25

## Symptom
Student had bereavement holidays assigned in Fidelo. SIS created two courses instead of one with holidays. Second course (BC 24686) has no class assignment or fee set.

## Root cause (live DB, Tue 28 Jul 2026 UTC)
- Student 1052 (Alberto Squillace): booking 1611 Confirmed, EUR 1280.12/1280.12 fully paid
- Booking course 24686 (Morning General, 20 Jul-18 Sep 2026): active=true, fee=null, 0 class assignments
- 7 teaching days lost since Jul 20 (Mon-Fri Jul 20-24 + Mon 27 + Tue 28 today)
- 51 calendar days remain to course end (Sep 18)
- No holidays recorded on this booking course in SIS

## Fix recipe (NOT YET RUN)
1. Assign student 1052 to a Morning General class on BC 24686: SIS -> Booking 1611 -> BC 24686 -> add class assignment
2. Set BC 24686 fee: check deal/invoice for correct fee amount and update
3. Optional: verify if bereavement holidays should be recorded on booking 1611 for the period before Jul 20

## Risk / category
- Category: bookings / class assignment + data hygiene
- Reversible: yes
- Blast radius: student 1052 only

## Status
URGENT — FIX NOT RUN. 7 teaching days lost; 51 calendar days remain (Sep 18 end). Assign now.

**Last checked:** Tue 28 Jul 2026 UTC (139th hourly check)

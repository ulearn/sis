# Issue 12 — Rakan Alghamdi: Day 8, 0 Class Assignments (149th check, Mon 10 Aug 2026)

**Reporter:** PG | **Area:** Booking / Accomm | **Sheet row:** 13

## Symptom
Rakan Alghamdi started General English Academic Year AM Plus on 3 Aug 2026. After 8 days, he has no class assignment in SIS.

## Root Cause
- Booking Course 25035 (General English Academic Year AM Plus, booking 17915, student 14444 Rakan Alghamdi)
- Started 2026-08-03, ends 2026-12-18, active = true, 0 class assignments — confirmed live Mon 10 Aug 2026
- Student has been in school 8 days with no attendance record possible
- Accommodation and LOA correct (Issues 5 and 14 RESOLVED)

## Fix Recipe (NOT YET RUN)

1. SIS Admin > Classes > find AM Plus / General English AM class
2. Add Student Class Assignment for BC 25035 (Rakan Alghamdi), week_start = 2026-08-10
   Optionally backdate to 2026-08-03 to record weeks 1-2 attendance
3. Verify assignment in Rakan booking view

## Risk / Category
**bookings / class-assignment** — Reversible. Student in school 8 days without class record.

## Status
**Open — NOT YET RUN.** Last checked: Mon 10 Aug 2026 UTC (149th hourly check).

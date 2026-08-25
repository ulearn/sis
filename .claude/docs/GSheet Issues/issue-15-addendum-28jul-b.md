# Issue 15 — Saikhantes Shagdarsuren — 127th check Tue 28 Jul 2026 UTC

**Reporter:** Staff | **Area:** Booking / Class | **Sheet row:** 16

## Symptom
Student course dates and holidays did not make sense (two courses, migration artefact).

## Root cause (live DB, Tue 28 Jul 2026 UTC)
- Student 1001 (Saikhantes Shagdarsuren): on holiday 20 Jul-21 Aug 2026, returns Mon 24 Aug
- Booking course 24925 (Academic Year Afternoon, 9 Mar-2 Oct 2026): active=true, booking 18151
- Class assignment 255: class 11, week start/end dates stored as null in DB — effectively expired as of Jul 3
- Student needs a new class assignment from return date (24 Aug) to course end (2 Oct 2026)

## Fix recipe (NOT YET RUN)
1. SIS -> Booking 18151 -> BC 24925 (Academic Year Afternoon, Mar 9-Oct 2) -> Class Assignments
2. End or archive the expired CA 255 (class 11, dates null)
3. Add new class assignment: class 11, week start 24 Aug 2026, week end 2 Oct 2026 (course end)

NOTE: Student is currently on holiday (Jul 20-Aug 21). No urgency until Aug 23 — must be done BEFORE Aug 24 when student returns.

## Risk / category
- Category: bookings / class assignment
- Reversible: yes
- Blast radius: student 1001 only

## Status
Open — FIX NOT RUN. Student on holiday until Aug 21; new SCA needed before Aug 24 return.

**Last checked:** Tue 28 Jul 2026 UTC (127th hourly check)

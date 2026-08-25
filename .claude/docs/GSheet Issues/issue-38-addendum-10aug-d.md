# Issue 38 — Unassigned Booking Courses (104th check, Mon 10 Aug 2026)

**Reporter:** PG | **Area:** Holidays, Bookings | **Sheet row:** 40

## Symptom
Students starting new courses have no class record.

## Root Cause
104th hourly check Mon 10 Aug 2026 UTC. Two cohorts confirmed in live DB:

**13 Aug-10 new starters with 0 SCAs (need same-day assignment):**
- BC 108 Lucia Borroni — Intensive General 30 — ends 2026-08-21
- BC 109 Maicol Moretti — Morning General — ends 2026-08-21
- BC 1313 Ana Luiza De Sousa — Academic Year Afternoon — ends 2026-08-28
- BC 1818 Natanael Reis Lourenco — Academic Year Morning — ends 2026-12-18
- BC 24915 Toshimi Hanakawa — Academic Year Morning — ends 2027-01-29
- BC 24970 Tsengelbayar Mendsaikhan — Academic Year Afternoon — ends 2027-01-29
- BC 25004 Vincenzo Contu — General English AM Plus — ends 2026-08-14 URGENT (4 days)
- BC 25005 Claudia Mereu — General English AM — ends 2026-08-14 URGENT (4 days)
- BC 25024 Josimar Roberto — General English PM — ends 2026-08-21
- BC 25027 Jacqueline Burgos — Academic Year Morning — ends 2027-02-12
- BC 25031 Brisia Garcia Roman — Academic Year Morning — ends 2027-02-12
- BC 25036 Jorge Perez Aldana — General English AM — ends 2026-09-04
- BC 25039 Cristian Ravai — General English PM Plus — ends 2026-08-28

URGENT: BC 25004 (Vincenzo) + BC 25005 (Claudia) end Fri Aug 14 — 4 days.

**6 Aug-3 stragglers with 0 SCAs (day 8):**
- BC 1766 Maria Eduarda Alves Paiva — AY Renewal Morning — ends 2026-09-04
- BC 25003 Aleix Cervera Gonzalez — General English AM — ends 2026-09-18
- BC 25010 Alin Merticariu — General English AM — ends 2026-08-28 (18 days)
- BC 25016 Anderson da Silva Martins — Life Pass Morning — ends 2027-01-22
- BC 25029 Monica Breier Fiametti — Academic Year Morning — ends 2026-11-13
- BC 25035 Rakan Alghamdi — GE Academic Year AM Plus — ends 2026-12-18 (see Issue 12)

Note: Maria Eduarda also has BC 24885 (AY Morning bk18092, ends 2026-08-21) 0 SCAs — separate booking.
Background: 24,479 stale BCs still active (Issue 45 not run). These 19 are real active students.

## Fix Recipe (NOT YET RUN)

Assign via SIS Admin > Classes > [class name] > Add Student Assignment, priority order:
1. BC 25004 (Vincenzo Contu, ends Aug 14 — 4 days)
2. BC 25005 (Claudia Mereu, ends Aug 14 — 4 days)
3. BC 25010 (Alin Merticariu, ends Aug 28 — 18 days)
4. All 11 remaining Aug-10 starters
5. 4 remaining Aug-3 stragglers (excl Rakan — Issue 12)

## Risk / Category
**bookings / class-assignment** — Reversible. Students in school missing attendance records.

## Status
**Open — NOT YET RUN.** Last checked: Mon 10 Aug 2026 UTC (104th hourly check).
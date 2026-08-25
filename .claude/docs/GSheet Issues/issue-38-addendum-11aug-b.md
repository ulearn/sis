# Issue 38 — Aug-10 Starters: Progress Update (116th check, Tue 11 Aug 2026 UTC)

**Reporter:** Various staff | **Area:** Bookings / Class Assignments | **Sheet row:** 40

## Symptom
Students who started Mon Aug 10 are not assigned to classes. Eduardo Roche Diaz course ends **Fri 14 Aug** — Day 2 of 5.

## Progress since morning check (115th to 116th)

**Now assigned (since earlier today):**
- BC 25024 — Josimar Roberto (student 14612, booking 18246): 1 SCA confirmed
- BC 25036 — Jorge Perez Aldana (student 14619, booking 18256): 1 SCA confirmed

**Still 0 SCAs:**

| BC | Student | Course | Ends | Urgency |
|----|---------|--------|------|---------|
| 25043 | Eduardo Roche Diaz (student 14602, bk 18265) | General English PM | 14 Aug | CRITICAL |
| 1313 | Ana Luiza De Sousa (student 744, bk 1286) | AY Afternoon | 28 Aug | High |
| 25039 | Cristian Ravai (student 17, bk 18259) | General English PM Plus | 28 Aug | High |
| 24970 | Tsengelbayar Mendsaikhan (student 948, bk 18194) | AY Afternoon | 29 Jan 2027 | Normal |

## Fix recipe (NOT YET RUN)

### Step 1 — Eduardo Roche Diaz (do immediately)
1. SIS Admin: Student 14602, Booking 18265, Booking Course 25043
2. Ask Paul which General English PM class Eduardo joins
3. Create Student Class Assignment: weekStart = 2026-08-10, weekEnd = 2026-08-14
4. Enter retroactive attendance Mon 10 Aug + Tue 11 Aug

### Step 2 — Ana Luiza De Sousa (by Aug 28)
1. SIS Admin: Student 744, Booking 1286, Booking Course 1313
2. Create SCA: weekStart = 2026-08-10, appropriate AY Afternoon class
3. Enter retroactive attendance

### Step 3 — Cristian Ravai (by Aug 28)
1. SIS Admin: Student 17, Booking 18259, Booking Course 25039
2. Create SCA: weekStart = 2026-08-10, General English PM Plus
3. Enter retroactive attendance

### Step 4 — Tsengelbayar Mendsaikhan (by Jan 2027)
1. SIS Admin: Student 948, Booking 18194, Booking Course 24970
2. Create SCA: weekStart = 2026-08-10, AY Afternoon class
3. Enter retroactive attendance

## Risk / category
- **Category:** bookings / attendance
- **Reversible?** Yes — SCAs can be deleted and recreated
- **Blast radius:** Eduardo: 5-day course, 2+ days attendance unrecorded. Others: AY courses, recoverable.

## Status
Partially resolved — BCs 25024 (Josimar) and 25036 (Jorge) assigned since morning. Eduardo (25043), Ana Luiza (1313), Cristian (25039), Tsengelbayar (24970) still unassigned.
**Last checked:** Tue 11 Aug 2026 UTC (116th check, Issue 38)
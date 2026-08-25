# Issue 38 — Aug-10 Starters Without Class Assignments (Day 2 Update)

**Reporter:** Various staff | **Area:** Bookings / Class Assignments | **Sheet row:** 40 | **Check:** Tue 11 Aug 2026 UTC

## Symptom
Students who started Mon Aug 10 are not assigned to classes. Eduardo Roche Diaz course ends **Friday 14 Aug** — today is Day 2 of a 5-day course.

## Root cause (live data, 11 Aug 2026)

**MOST URGENT — Eduardo Roche Diaz (BC 25043)**
- Student 14602, Booking 18265, CONFIRMED, conf = true
- General English PM, started Mon 10 Aug, ends **Fri 14 Aug 2026**
- Today = Day 2 of 5; 2 days attendance unrecorded; 0 class assignments

**Other CONFIRMED Aug-10 starters still with 0 SCAs:**
| BC ID | Student | Student ID | Booking ID |
|-------|---------|------------|------------|
| 1313  | Ana Luiza De Sousa | 744 | 1286 |
| 24970 | Tsengelbayar Mendsaikhan | 948 | 18194 |
| 25024 | Josimar Roberto | 14612 | 18246 |
| 25036 | Jorge Perez Aldana | 14619 | 18256 |
| 25039 | Cristian Ravai | 17 | 18259 |

**Expected no SCA (not CONFIRMED):** Settiyanee Duangjai (BC 833, ESCROW), Nominjin Amartsogt (BC 25007, PARTIAL), Edith Nunes (BC 25042, PENDING).
Aug-11 starters: none in DB.

## Fix recipe (NOT YET RUN)

### Step 1 — Eduardo (do today)
1. SIS Admin: Student 14602, Booking 18265, BC 25043
2. Ask Paul which General English PM class Eduardo joins
3. Create SCA: weekStart = 2026-08-10 (Mon), weekEnd = 2026-08-14 (Fri)
4. Enter retroactive attendance for Mon 10 + Tue 11

### Step 2 — Remaining CONFIRMED Aug-10 starters
Assign each to appropriate class via SIS Admin, weekStart = 2026-08-10:
- BC 1313: Ana Luiza De Sousa (student 744)
- BC 24970: Tsengelbayar Mendsaikhan (student 948)
- BC 25024: Josimar Roberto (student 14612)
- BC 25036: Jorge Perez Aldana (student 14619)
- BC 25039: Cristian Ravai (student 17)

## Risk / category
- **Category:** bookings / attendance
- **Reversible?** Yes — SCA deletable if wrong class assigned
- **Blast radius:** Eduardo: 5 days PM attendance at risk. Others: 2 days AY (recoverable).

## Status
Open — no fix applied as of this check.
**Last checked:** Tue 11 Aug 2026 UTC (115th check, Issue 38)
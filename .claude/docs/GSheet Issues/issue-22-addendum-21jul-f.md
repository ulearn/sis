# Issue 22 addendum -- 33rd hourly Tue 21 Jul 2026 UTC (56th check)

Status: UNCHANGED. Booking course 24991 still 0 class assignments. 7 school days missed (Jul 13-17 and Jul 20-21).

BC24991 | Edith Nunes | s1015 | bk18214 | General English AM | 13 Jul-7 Aug 2026
Fee: EUR 608 paid. Zero class assignments. 13 school days remaining (Jul 22-24 and Jul 27-Aug 7).

Note: previous checks reported 11 remaining and 8 missed -- both off.
Correct: Missed = Jul 13-17 (5) + Jul 20-21 (2) = 7 total. Remaining = Jul 22-24 (3) + Jul 27-31 (5) + Aug 3-7 (5) = 13.

Duplicate booking courses still stale:
BC24933 | General English AM | bk18158 | ended 10 Jul 2026 | active = true (11 days stale)
BC24934 | General English AM | bk18158 | ended 10 Jul 2026 | active = true (11 days stale) | fee EUR 360

Fix recipe (NOT YET RUN):
1. SIS: Student 1015 > Booking 18214 > Booking Course 24991 > assign class (P1 -- do today)
2. Set active = false on booking course 24933 and booking course 24934 (booking 18158)

Risk: class-assignments. Reversible.
Last checked: Tue 21 Jul 2026 UTC (33rd hourly, 56th check).
# Issue 45 addendum C — Mon 20 Jul 2026 (48th check, 18th hourly)

Area: Class assignment — zero SCA | Sheet row 47

## Current status (fresh DB Mon 20 Jul 2026 UTC)

All four booking courses confirmed at 0 class assignments (live DB).

BC    | Student                              | Course | Period          | Missed         | Remaining       | Priority
25011 | Eduardo Roche Diaz                   | GE PM  | 20 Jul - 24 Jul | 0 (day 1)      | 4 incl. today   | ENDS FRIDAY — do first
24945 | Sarah Venturini Talizin              | GE AM  | 6 Jul - 31 Jul  | 11 school days | 9               | Critical
24998 | Allison Guadalupe Ayala Vazquez      | GE PM  | 13 Jul - 31 Jul | 6 days         | 9               | Urgent
24990 | Samuele Stenico                      | GE AM  | 13 Jul - 7 Aug  | 6 days         | 13              | Urgent

Cross-tracked:
- BC24991 Edith Nunes (GE AM, 13 Jul to 7 Aug): tracked Issue 22
- BC24609 Xuezhen Huang (Morning General, 13 Jul to 31 Jul): tracked Issue 39

Note: Aug 3 Bank Holiday absent from school_closures — Samuele count of 13 includes Aug 3 incorrectly (Issue 38 fix pending).

## Fix recipe (NOT YET RUN)

In priority order:
1. SIS Admin → Booking 18233 (Eduardo Roche Diaz) → BC25011 → Assign to GE PM class — ends Friday, assign TODAY
2. SIS Admin → Booking 18169 (Sarah Venturini Talizin) → BC24945 → Assign to GE AM class — 11 days already missed
3. SIS Admin → Booking 18221 (Allison Guadalupe Ayala Vazquez) → BC24998 → Assign to GE PM class
4. SIS Admin → Booking 18213 (Samuele Stenico) → BC24990 → Assign to GE AM class

## Risk
Class assignment — fully reversible. No financial impact. Blast radius: 4 students absent from class registers until assigned.

## Status
OPEN. Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (48th check, 18th hourly).
Issue 53 - Fanny Scelles - Multi-Host Accommodation Template Gap
Reporter: KC | Area: Booking / Accomm | Sheet row 55 | Run: 471st, Sun 23 Aug 2026 UTC

Symptom
No template exists for students with multiple accommodation bookings across different hosts.

Root Cause (confirmed from live DB, 471st run)
Student Fanny Scelles (14451), booking 17843:
- BA 11267: bed 23, 29 Aug to 4 Oct 2026, fee EUR 3,840 - Host 1
- BA 11399: bed 54, 4 Oct to 19 Dec 2026, fee = NULL - Host 2 (fee still missing)
- Student arrives 29 Aug 2026 = 6 days

Issue: SIS confirmation email only covers single-host scenarios.

Fix Recipe (NOT YET RUN)

Immediate (before 29 Aug):
1. Set fee on BA 11399 (see issue-52-addendum-23aug-b.md)
2. Manually send host confirmation emails to each host separately using single-host template

Longer term: Neil to spec multi-host booking template before implementation.

Risk / Category
- Category: bookings / feature gap (code)
- Blast radius: any student with 2+ hosts; edge case
- DEADLINE: 29 Aug 2026 (6 days) - handle Fanny manually; spec template separately

Status: AWAITING SPEC; fee fix on BA 11399 NOT RUN
Last checked: 2026-08-23 (471st run UTC)
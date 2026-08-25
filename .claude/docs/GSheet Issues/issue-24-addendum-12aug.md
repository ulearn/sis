Issue 24 — Alberto Squillace — BC 24686 no class assignment, day 23 (addendum 12 Aug 2026)
Sheet row: 25 | Reporter: AC | Area: Booking

Symptom
Migration-era student; Fidelo recorded holidays. On SIS, BC 24686 started 20 Jul 2026 with 0 class assignments. Attendance unrecorded.

Root cause (live data — Wed 12 Aug 2026 UTC, 71st check)
- Booking Course 24686 (Alberto Squillace, student 1052): Morning General, 20 Jul to 18 Sep 2026
  active = true, 0 class assignments — 23 calendar days (~17 school days) of attendance unrecorded
- Booking 1611: CONFIRMED, confirmed = true, EUR 1,280.12 paid, EUR 0 open — fully settled
- Booking Course 1797 (Morning General, ended 26 Jun 2026): active = true — 47 days stale
- Course ends 18 Sep 2026 — 37 calendar days remaining

No new changes since yesterday.

Fix recipe (NOT YET RUN)
Step 1 — Deactivate stale BC 1797:
  UPDATE booking_course SET active = false WHERE id = 1797;

Step 2 — Assign BC 24686 to correct Morning class in SIS admin:
  Check prior SCA on old BC 1797 to identify Alberto's class.
  Assign student 1052 to BC 24686 with weekStart=2026-07-20, weekEnd=2026-09-18.

Step 3 — Verify SCA created and visible on class list.

Note: Aug 3 Bank Holiday excluded automatically by school closure system.
Historical weeks (Jul 20 to present) cannot be back-populated without manual attendance entry.

Risk / category
Attendance + data-hygiene. Reversible. 1 student. Course ends Sep 18 — 37 days left to recover going forward.

Status: open — fix NOT RUN
Last checked: Wed 12 Aug 2026 UTC
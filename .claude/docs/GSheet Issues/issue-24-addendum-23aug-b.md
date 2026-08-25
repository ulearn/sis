Issue 24 -- Alberto Squillace (booking 1611)
Reporter: AC | Area: booking | Sheet row 25

Symptom
BC 24686 (Jul 20 to Sep 18 2026) has 0 SCAs. BC 1797 ended Jun 26, still active (stale).
BC 24686 ends in 26 days; no attendance recorded for current course block.

Root cause
- BC 1797 (Morning General): endDate 2026-06-26, active = true -- 58 days stale; SCA 229 class 12 expired Apr 26
- BC 24686 (Morning General): startDate 2026-07-20, endDate 2026-09-18, 0 SCAs, 34 days elapsed
- Booking 1611: CONFIRMED, fully paid EUR 1,280.12

Fix recipe (NOT YET RUN)

Step 1: Create SCA on BC 24686 -- Class: 12, weekStart: 2026-07-20, weekEnd: 2026-09-18
Step 2: Deactivate BC 1797 (active = false)

Risk / category
- Category: bookings / class assignments
- Reversible: yes
- Blast radius: booking 1611 only
- Mild urgency: BC 24686 ends Sep 18 (26 days away)

Status: OPEN -- Fix NOT RUN
Last checked: 2026-08-23 UTC (483rd run, 90th issue check)
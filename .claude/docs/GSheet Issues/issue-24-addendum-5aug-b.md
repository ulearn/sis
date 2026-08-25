Issue 24 - Alberto Squillace - Missing SCA + Stale BC
Reporter: pg | Area: booking | Sheet row 25

Symptom: Short-term student with Fidelo holidays; SIS course split wrong; missing SCA.

Root cause (55th hourly check - Wed 5 Aug 2026 UTC)

Booking 1611 (Alberto Squillace, student 1052):
  BC 1797: Morning General, start 2026-04-06, end 2026-06-26, active=true, SCAs=1
           --> STALE: 40 days past end date. Should be deactivated.
  BC 24686: Morning General, start 2026-07-20, end 2026-09-18, active=true, SCAs=0
           --> CURRENT: 16 days in, no class assignment - overdue.

Fix recipe (NOT YET RUN)

Step 1 - Deactivate stale BC 1797:
  UPDATE booking_course SET active = false WHERE id = 1797;

Step 2 - Assign class for BC 24686:
  SIS -> Classes -> Assign. Alberto Squillace, BC 24686 (Morning General, ends 2026-09-18).
  Assign current week and remaining weeks.

Risk: bookings / class-assignment | Reversible: yes | Blast radius: low
Status: Open - BC 24686 16d in without SCA; BC 1797 40d stale. NOT RUN.
Last checked: Wed 5 Aug 2026 UTC (55th hourly check)
Issue 45 - Eduardo Roche Diaz / Renewal Arrivals (Addendum 29 Jul 2026)

Reporter: AC | Area: Renewal students | Sheet row: 47

Root cause (verified Wed 29 Jul 2026 UTC - 113th hourly check)
- Booking course 25011 (General English PM, 20 Jul to 24 Jul 2026): active=true, ended Fri 24 Jul - 6 days stale (was 5d)
- Class assignment window permanently closed; attendance for Jul 20-24 irrecoverable
- Booking 18233: student 14602 Eduardo Roche Diaz, status=Confirmed
- Only BC on this booking - no subsequent BC; data hygiene only

Fix recipe (NOT YET RUN)

Deactivate stale BC 25011:
  UPDATE booking_courses SET active = false WHERE id = 25011;

No attendance recovery possible - class window closed permanently.

Risk: data-hygiene | Reversible: yes (set active=true) | Blast radius: 1 booking course.

Status: OPEN - Fix NOT RUN - data hygiene; window permanently closed (6d stale)
Last checked: Wed 29 Jul 2026 UTC (113th hourly check)
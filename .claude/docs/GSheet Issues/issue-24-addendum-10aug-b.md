Issue 24 — Alberto Squillace BC 24686 No Class (Addendum 10 Aug 2026, run b)

Reporter: AC | Area: booking | Sheet row: 25

Root Cause (68th check, Mon 10 Aug 2026 UTC — unchanged):
- Student 1052 (Alberto Squillace), Booking 1611
- Booking Course 24686: Morning General, started 2026-07-20, ends 2026-09-18 — 21 days in, 0 SCAs
- Booking Course 1797: Morning General (old), ended 2026-06-26 — 45 days stale, active = true, has 1 SCA
- Booking: CONFIRMED, confirmed = true, EUR 1,280.12 paid, service end 2026-09-18
- Student visa_status = null

FIX RECIPE — NOT YET RUN
Step 1: Deactivate stale BC 1797 (old course, ended Jun 26):
  UPDATE booking_courses SET active = false WHERE id = 1797;

Step 2: Assign BC 24686 to appropriate AM class in SIS admin
  (Alberto was in Morning General previously — likely same class)

Risk: data-hygiene + attendance. Reversible. Blast radius = 1 student.
Status: Open — 21 days unrecorded.
Last checked: Mon 10 Aug 2026 UTC (68th check)
# Issue 24 — Alberto Squillace (4th check Fri 31 Jul 2026)

Reporter: AC | Area: Booking | Sheet row: 25

## Status: Unchanged from 3rd check; hash change is whitespace artefact

## Evidence (live DB)

- Student 1052 (Alberto Squillace): visa_status = null (last touched 2026-07-28 09:38 UTC)
- Booking course 24686 (Morning General, Jul 20 to Sep 18 2026): active, fee = null, booking 1611
  - No class assignment found — 10 teaching days already lost (weeks Jul 20, Jul 27)
  - ~34 teaching days remain from Aug 4 (Aug Bank Holiday Aug 3 excluded)
- Booking course 1797 (Morning General, Apr 6 to Jun 26 2026): active = true — 35 days stale
- Last class assignment 229: class 12 (B1 AM 2), Apr 6 to Apr 26 — expired 96 days ago

CORRECTION: visa_status column is TEXT type — correct value is Approved (title case, NOT APPROVED).

## Fix recipe (NOT YET RUN)

1. Set visa status (verify from HubSpot contact first):
   UPDATE students SET visa_status = 'Approved', updated_at = NOW() WHERE id = 1052;

2. Set booking course 24686 fee (confirm EUR amount from HubSpot deal):
   UPDATE booking_courses SET fee = <amount>, updated_at = NOW() WHERE id = 24686;

3. Deactivate stale booking course 1797:
   UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 1797;

4. Create class assignment for BC 24686 (class 12, B1 AM 2, from Aug 4 to Sep 18):
   INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end)
   VALUES (1052, 24686, 12, '2026-08-04', '2026-09-18');

## Risk: Medium — Alberto enrolled but no class; 10 days lost. Reversible.
## Last checked: Fri 31 Jul 2026 UTC (4th check today)

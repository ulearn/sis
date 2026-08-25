Issue 23: Enshi Lu - Backwards Course Dates + Stale BCs
Reporter: pg | Area: booking / class / holiday | Sheet row: 24 | 9th check Mon 10 Aug 2026 UTC

SYMPTOM
Course dates do not make sense - start March, finish February.

ROOT CAUSE - 9th check Mon 10 Aug 2026 UTC (unchanged from 8th check Sat 8 Aug)
Booking Course 828 (Academic Year Morning, booking 787, student 397 Enshi Lu):
  startDate=2026-03-02, endDate=2026-02-27 -- BACKWARDS (DST migration bug, end 3 days before start)
Booking Course 826 (ended 28 Nov 2025): active=true -- 255 days stale
Booking Course 827 (ended 30 Jan 2026): active=true -- 192 days stale
Booking Course 829 (ended 5 Jun 2026): active=true -- 66 days stale

FIX RECIPE - NOT YET RUN
Step 1 - Fix BC 828 end date (confirm correct end with Neil before running):
UPDATE BookingCourse SET endDate='2026-09-18' WHERE id=828;

Step 2 - Deactivate stale BCs 826, 827, 829:
UPDATE BookingCourse SET active=false WHERE id IN (826,827,829);

Step 3 - Deactivate BC 828 if course has now ended:
UPDATE BookingCourse SET active=false WHERE id=828;

Step 4 - Verify:
SELECT id, startDate, endDate, active FROM BookingCourse WHERE id IN (826,827,828,829);

RISK: bookings/data-hygiene. Low priority per staff (student finished). Reversible. Blast radius: student 397 only.

STATUS: OPEN. BC 828 backwards dates; BCs 826/827/829 255d/192d/66d stale.
Last checked: 2026-08-10 UTC
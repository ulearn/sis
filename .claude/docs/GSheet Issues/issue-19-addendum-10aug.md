Issue 19: Maï Lan Chu - BCs 89+90 Stale
Reporter: Staff | Area: Booking / Class | Sheet row: 20 | 8th check Mon 10 Aug 2026 UTC

SYMPTOM
Not appearing in class to be assigned list.

ROOT CAUSE - 8th check Mon 10 Aug 2026 UTC (unchanged from 7th check Sun 9 Aug)
Booking Course 89 (Morning IELTS, booking 83): ended 2026-05-22 -- 80 days stale, active=true
Booking Course 90 (Private Lessons, booking 83): ended 2026-05-22 -- 80 days stale, active=true
Both on booking 83. No fix applied.

FIX RECIPE - NOT YET RUN
Step 1 - Deactivate BCs 89 + 90:
UPDATE BookingCourse SET active=false WHERE id IN (89,90);

Step 2 - Verify:
SELECT id, endDate, active FROM BookingCourse WHERE id IN (89,90);
Expected: both active=false.

RISK: data-hygiene. Reversible. Blast radius: student on booking 83 only.

STATUS: OPEN. BCs 89+90 now 80 days stale.
Last checked: 2026-08-10 UTC
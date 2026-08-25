Issue 21: Maurivan Kuhl - BC 1604 Stale
Reporter: AC | Area: Booking / Class | Sheet row: 22 | 18th check Mon 10 Aug 2026 UTC

SYMPTOM
Appears in A1 AM and A2 AM WB 11.05.2026 - should only be in A2 AM.

ROOT CAUSE - 18th check Mon 10 Aug 2026 UTC (unchanged)
Booking Course 1604 (Morning General, booking 1461, student 912 Maurivan Kuhl):
  ended 2026-07-03 -- 38 days stale, active=true
Booking 1461: CONFIRMED, confirmed=true, EUR 1,509.60 paid, fully settled.

FIX RECIPE - NOT YET RUN
Step 1 - Deactivate BC 1604:
UPDATE BookingCourse SET active=false WHERE id=1604;

Step 2 - Verify:
SELECT id, endDate, active FROM BookingCourse WHERE id=1604;
Expected: active=false.

RISK: data-hygiene. Reversible. Blast radius: student 912 only.

STATUS: OPEN. BC 1604 38 days stale.
Last checked: 2026-08-10 UTC
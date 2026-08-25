# Issue 52: Fanny Scelles (Student 14451) — BA 11399 Fee Missing
Reporter: XX | Area: Booking / Accomm | Sheet row 54 | 466th run 2026-08-22 UTC

## Root cause
- Student 14451 (Fanny Scelles) arrives 29 Aug 2026 -- 7 days
- BA 11267 (bed 23): 29 Aug to 4 Oct 2026, fee EUR 3840, active=true -- first host, OK
- BA 11399 (bed 54): 4 Oct to 19 Dec 2026, fee=null, active=true -- second host, fee unset
- Booking 17843 linked to both BAs

## Fix recipe (NOT YET RUN)
Step 1 -- Set fee on BA 11399 (confirm correct EUR amount from invoice):
  SELECT id,bed_id,start_date,end_date,fee,active,booking_id FROM booking_accommodations WHERE id=11399;
  -- UPDATE booking_accommodations SET fee=XXXX, updated_at=NOW() WHERE id=11399;

Step 2 -- Multi-host confirmation template (pending Neil spec):
  System currently sends individual host confirmation per BA.
  Neil to specify: one document per BA (current), or one combined multi-host document.
  No code change until spec confirmed.

## Risk
documents/bookings -- reversible. Blast radius: Fanny Scelles only.

## Status
Student arrives 29 Aug (7 days). BA 11399 fee still null. Multi-host template pending spec.

## Last checked
466th run -- 2026-08-22 UTC
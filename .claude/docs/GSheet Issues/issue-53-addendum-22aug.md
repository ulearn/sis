# Issue 53: Multi-Host Template / Fanny Scelles (Student 14451)
Reporter: XX | Area: Booking / Accomm | Sheet row 55 | 466th run 2026-08-22 UTC

## Root cause
Same underlying data as Issue 52 (row 54):
- Student 14451 (Fanny Scelles) arrives 29 Aug 2026 -- 7 days
- BA 11267 (bed 23): 29 Aug to 4 Oct, fee EUR 3840, active=true -- first host, OK
- BA 11399 (bed 54): 4 Oct to 19 Dec, fee=null, active=true -- second host, fee missing
- Multi-host template: code change awaiting Neil spec

## Fix recipe (NOT YET RUN)
Immediate -- Set fee on BA 11399 (see issue-52-addendum-22aug.md Step 1):
  SELECT id,bed_id,start_date,end_date,fee,active FROM booking_accommodations WHERE id=11399;
  -- UPDATE booking_accommodations SET fee=XXXX, updated_at=NOW() WHERE id=11399;

Code change -- Multi-host template (pending Neil spec):
  Neil to decide: one doc per BA (current behaviour), or one combined doc for multi-host stays.
  No code change until spec is confirmed.

## Risk
documents/code -- low blast radius (template only). Fee update reversible.

## Status
Student arrives 29 Aug (7 days). Fee null. Multi-host template pending spec.

## Last checked
466th run -- 2026-08-22 UTC
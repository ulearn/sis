# Issue 41 Addendum 12 Aug 2026 (55th check) — Stale BAs Found on Bed 168

Reporter: KC  Area: Booking/Accomm  Sheet row: 43

## New Finding (55th check ~19:00 UTC)
While confirming bed 168 availability for Giampaolo Russo (BA 11392, Sep 6-14),
found 4 stale Booking Accommodations on bed 168 that are past their end dates but still active=true.

## Stale BAs on Bed 168 (all active=true, all past end date)
- BA 11167: Apr 4 to Jul 4 2026 — ended 39 days ago
- BA 11257: Jul 4 to Jul 18 2026 — ended 25 days ago
- BA 23: Jul 19 to Aug 2 2026 — ended 10 days ago
- BA 11360: Aug 2 to Aug 8 2026 — ended 4 days ago

## Current + Future BAs on Bed 168 (correct)
- BA 11161: Aug 8 to Aug 22 2026 (current occupant)
- BA 11218: Aug 22 to Sep 5 2026 (next booking)
- BA 32: Sep 27 to Oct 11 2026 (future)

## Availability for Giampaolo
Gap Sep 5 to Sep 27 = FREE. Giampaolo needs Sep 6-14 — confirmed no conflict.

## Fix Recipe — NOT YET RUN
Step 1: Assign bed 168 to Booking Accommodation 11392 (Giampaolo, Sep 6-14 2026)
  UPDATE booking_accommodations SET bed_id = 168 WHERE id = 11392;
  Via SIS admin: Accommodation > find BA 11392 > assign bed 168 (Bed A, Capel St)

Step 2: Deactivate stale BAs (NOT YET RUN)
  UPDATE booking_accommodations SET active = false
  WHERE id IN (11167, 11257, 23, 11360);
  Verify each has genuinely ended (dates confirmed above) before running.

## Risk / Category
- Category: accommodation. Reversible.
- Blast radius: 1 student assigned; 4 stale records cleaned.
- Step 2 is cleanup only — stale BAs past end date, no current impact.

## Status
Fix NOT RUN. 55th check.
Last checked: Wed 12 Aug 2026 UTC ~19:00
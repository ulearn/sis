# Issue 38 Addendum 9 Aug f
Reporter: Staff | Row: 40 | Check: 86th Sun 9 Aug 2026 UTC

## Symptom
17 Booking Courses start Mon 10 Aug 2026. All still at 0 SCAs.

## Root Cause
Classes start TOMORROW Mon 10 Aug. Unchanged from 85th check.

13 confirmed-ready: BCs 108, 109, 1313, 1818, 24915, 24970, 25004, 25005, 25024, 25027, 25031, 25036, 25039

4 blocked:
- BC 96 (bk 88, Alessandro Signorotti): confirmed = false, must confirm first
- BC 833 (bk 790, Settiyanee Duangjai): Escrow, must release first
- BC 25007 (Nominjin Amartsogt, bk 18229): partial EUR 980 / 1350
- BC 25042 (Edith Nunes, bk 18262): pending EUR 0 / 456

## Fix Recipe (NOT YET RUN)
Step 1: UPDATE bookings SET confirmed = true WHERE id = 88;
Step 2: Release bk 790 from Escrow via SIS admin.
Step 3: Assign 15 ready BCs to classes via SIS admin.
Step 4: Chase payment or hold BC 25007 and BC 25042.

## Risk: bookings/class-assignment. CRITICAL (classes TOMORROW). Reversible.
## Status: Open. NOT RUN. Last checked: Sun 9 Aug 2026 UTC (86th check)
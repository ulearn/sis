# Issue 38 — Class Start Assignments (Addendum 9 Aug e)

Reporter: Staff | Area: Bookings/Holidays | Sheet row: 40 | Check: 85th, Sun 9 Aug 2026 UTC

## Symptom
17 Booking Courses start Mon 10 Aug 2026. All still at 0 SCAs as of 85th check.

## Root Cause
Classes start TOMORROW Mon 10 Aug. Unchanged from 84th check.

13 ready: BCs 108, 109, 1313, 1818, 24915, 24970, 25004, 25005, 25024, 25027, 25031, 25036, 25039

Pre-step: BC 96 (bk 88, Alessandro Signorotti) confirmed=false -> UPDATE bookings SET confirmed=true WHERE id=88 first.
Pre-step: BC 833 (bk 790, Settiyanee Duangjai) ESCROW -> release in SIS admin first.

Hold: BC 25007 (Nominjin, PARTIAL EUR 980/1350), BC 25042 (Edith Nunes, PENDING EUR 0/456).

## Fix Recipe (NOT YET RUN)

Step 1: UPDATE bookings SET confirmed = true WHERE id = 88;
Step 2: Release bk 790 from Escrow via SIS admin.
Step 3: Assign 15 ready BCs (96 post-Step1, 108, 109, 833 post-Step2, 1313, 1818, 24915, 24970, 25004, 25005, 25024, 25027, 25031, 25036, 25039) to classes.

## Risk
Category: bookings/class-assignment | Urgency: CRITICAL (classes tomorrow) | Reversible: yes

## Status
Open — fix NOT RUN. Last checked: Sun 9 Aug 2026 UTC (85th check)
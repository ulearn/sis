# Issue 41 ## Giampaolo Russo BA 11392 / Bed Null (74th check)
Reporter: Diego | Area: Booking/Accomm | Sheet row 43 | Fri 14 Aug 2026 UTC

## Root cause
- BA 11392: bedId = null, startDate 2026-09-06, endDate 2026-09-14, fee = EUR 415, active = true
- BA 11357 (host family Aug 2 to Sep 6): bed 178, correct
- Beds 168 and 194: no conflicts Sep 6-14 (verified 2026-08-14)
- Check-in: 23 days (2026-09-06)

## Fix recipe (NOT YET RUN)
1. Choose bed (168 or 194) via SIS accommodation matching view
2. UPDATE booking_accommodation SET bedId = CHOSEN_BED, updatedAt = NOW() WHERE id = 11392;

Risk: bookings | Reversible: yes | Blast radius: single BA
Status: Open - fix NOT RUN. Sep 6 check-in (23 days). Beds 168/194 available.
Last checked: 2026-08-14 UTC (74th)
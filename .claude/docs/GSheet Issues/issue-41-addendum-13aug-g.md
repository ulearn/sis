# Issue 41 — Giampaolo Russo / BA 11392 bed null (66th check Thu 13 Aug 2026)

Reporter: Staff (KC) | Area: Booking/Accomm | Sheet row: 43
66th check — Thu 13 Aug 2026 ~20:00 UTC

## Symptom
Booking Accommodation 11392 (Giampaolo Russo, ID 14571) has bed_id = null.
This is his apartment booking (Sep 6 – Sep 14 2026). Check-in is 24 days away.

## Root Cause (evidence)
- Booking Accommodation 11392: bedId = null, fee = EUR 415, Sep 6 – Sep 14 2026, active = true
- Booking Accommodation 11357 (host family Aug 2 – Sep 6): correctly placed
- Available beds from earlier checks: bed 168 (A1) and bed 194 (Arasain-1)
- No change since 65th check

## Fix Recipe (NOT YET RUN)

Step 1: Verify beds 168 and 194 are still unoccupied for Sep 6–14:
  SELECT ba.id, ba.bed_id, ba.start_date, ba.end_date FROM booking_accommodations ba
  WHERE ba.bed_id IN (168, 194) AND ba.active = true
  AND ba.start_date < 2026-09-14 AND ba.end_date > 2026-09-06;  -- NOT YET RUN

Step 2: Assign an available bed to Booking Accommodation 11392 in SIS Admin.
  Navigate to Giampaolo Russo (ID 14571) > Accommodation > BA 11392.
  Set bed to 168 or 194 (whichever confirmed available).

## Risk / Category
data-hygiene | Reversible: yes | Blast radius: 1 student, 1 booking accommodation

## Status
OPEN. Bed null 66 checks. Sep 6 check-in (24 days). Fix NOT RUN.

Last checked: 2026-08-13T20:00:00Z
Previous recipe: issue-41-addendum-13aug-f.md
# Issue 25 — Uyanga Tungalag (addendum 13 Aug 2026)

**Reporter:** AC | **Area:** visa / class | **Sheet row:** 26 | **Check:** 159th Thu 13 Aug 2026 UTC

## Symptom
Visa status not selected; cannot set to approved; student not appearing in class to be assigned.

## Root cause (unchanged)
- Student 917 (Uyanga Tungalag): visa_status = null, hubspotContactId = null; last updated 2026-07-28 (16 days ago)
- Booking 1467: CONFIRMED, confirmed = true, EUR 2,405 paid, EUR 0 open, service_end 2026-10-30
- Booking Course 1613 (Academic Year Morning, 2026-04-27 to 2026-10-30): active = true, 0 class assignments — 108 days attendance unrecorded

## Fix recipe (NOT YET RUN)

### Step 1 — Set visa_status
UPDATE Student SET visaStatus = APPROVED, updatedAt = NOW() WHERE id = 917;

### Step 2 — Assign BC 1613 to AM class
SIS admin → Student 917 → Bookings → Booking 1467 → Booking Course 1613 → assign to appropriate AM class.

### Step 3 — Link HubSpot contact
Look up in HubSpot, then: UPDATE Student SET hubspotContactId = <hs_id>, updatedAt = NOW() WHERE id = 917;

## Risk / category
- Category: bookings / data-hygiene
- Reversible: yes
- Blast radius: low — affects only student 917

## Status
Unchanged — 108 days 0 class assignments. Fix NOT RUN.

**Last checked:** 2026-08-13 UTC
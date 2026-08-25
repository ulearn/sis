# Issue 41 — Giampaolo Russo — 145th check Tue 28 Jul 2026 UTC

**Reporter:** Diego / Staff | **Area:** Booking / Accomm | **Sheet row:** 43

## Symptom
Student booked host family (Aug 2 - Sep 6) and Capel Street apartment (Sep 6 - Sep 14). Neither appeared in SIS matching section. Neither staff member could add the second accommodation.

## Root cause (live DB, Tue 28 Jul 2026 UTC)
- Booking 18180 (Giampaolo Russo, student 14571): Confirmed, EUR 2584.96/2584.96 fully paid
- Booking accommodation 11357: bed 178, host family, 2 Aug-6 Sep 2026, active=true, fee EUR 1250 — present and correct
- Capel apartment booking accommodation: ABSENT — only 1 BA on booking 18180
- Booking course 24956 (General English AM, 3 Aug-22 Aug 2026): starts Aug 3 (Aug Bank Holiday — blocked by Issue 38)
- HOST FAMILY CHECK-IN: Sun 2 Aug 2026 (5 days away)

## Fix recipe (NOT YET RUN)

### Step 1 — Fix Issue 38 first
Add Aug BH closure and shunt BC 24956 from Aug 3 to Aug 4 (see issue-38-addendum-28jul-g.md).

### Step 2 — Add Capel apartment BA
In SIS -> Booking 18180 -> Accommodation -> Add:
- Type: Capel Street apartment (premium room)
- Start date: 2026-09-06, End date: 2026-09-14 (1 week + 1 extra night per issue description)
- Fee: per agreement with student / booking details

### Step 3 — Verify host family matching
Confirm BA 11357 (bed 178) appears in the matching/allocation section for host family assignment.

## Risk / category
- Category: bookings / accommodation
- Reversible: yes (BA can be deleted if wrong)
- Blast radius: student 14571 only

## Status
URGENT — FIX NOT RUN. Host family check-in Sun 2 Aug (5 days). Capel BA must be added before Sep 6.

**Last checked:** Tue 28 Jul 2026 UTC (145th hourly check)

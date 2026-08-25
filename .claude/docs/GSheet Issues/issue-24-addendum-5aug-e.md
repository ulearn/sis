# Issue 24 — Alberto Squillace: Stale BC + Unassigned Active BC (58th Check)
Reporter: PG | Area: Booking | Sheet row: 25 | 58th check Wed 5 Aug 2026 UTC
No change from 57th check.

## State (verified live DB)
BC 1797 (Morning General): end_date=2026-06-26, active=true — 40 days stale, 1 SCA
BC 24686 (Morning General): start=2026-07-20, end=2026-09-18, active=true — 0 SCAs, 16 days in without class

## Root Cause
BC 1797 ended 26 Jun and was never deactivated. BC 24686 (continuation course from 20 Jul) has never been
assigned to a Morning General class — 16 school days of attendance not being captured.

## Fix Recipe (NOT YET RUN)
Step 1: UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=1797;
Step 2: SIS admin → Classes → To Be Assigned → BC 24686 → assign to Morning General class.
        Backfill attendance from 2026-07-20 if Alberto has been attending.
Note: Verify HubSpot deal for second term (BC 24686, Jul–Sep 2026).

## Risk
Category: Bookings/class assignments | Reversible: Yes | Blast radius: 1 student, 16d missing attendance
Status: OPEN — NOT YET RUN | Last checked: Wed 5 Aug 2026 UTC (58th check)
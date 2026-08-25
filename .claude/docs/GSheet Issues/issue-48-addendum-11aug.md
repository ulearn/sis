# Issue 48 -- Telmuun Enkhsaikhan: BC 1810 Unassigned Day 44 + Fidelo Gap

**Reporter:** Staff | **Area:** Attendance / Classes | **Sheet row:** 50 | **Check:** Tue 11 Aug 2026 UTC

## Root cause (live data, 11 Aug 2026)
- **Student 293** (Telmuun Enkhsaikhan), **Booking 1624**, PARTIAL, confirmed = false
- amountPaid = EUR 1,406, amountOpen = EUR 250
- **BC 1810** (Academic Year Renewal Morning, 2026-06-29 to 2027-01-01): active, **44 days, 0 SCAs**
- **Fidelo payment gap**: Payment 17956 = EUR 100 only (xeroId null); EUR 1,306 gap = Fidelo migration artefact
- **6 stale Booking Courses** (all active, all ended):
  - BC 482: AY Afternoon, ended 2025-03-14
  - BC 483: AY Afternoon, ended 2025-07-11
  - BC 1609: AY Renewal Afternoon, ended 2025-12-19
  - BC 1610: AY Renewal Afternoon, ended 2026-01-09
  - BC 1611: AY Renewal Afternoon, ended 2026-03-06
  - BC 1612: AY Renewal Afternoon, ended 2026-05-01

## Fix recipe (NOT YET RUN)

### Step 1 -- Deactivate 6 stale Booking Courses
UPDATE booking_course SET active = false WHERE id IN (482, 483, 1609, 1610, 1611, 1612); -- NOT YET RUN

### Step 2 -- Assign Telmuun to class for BC 1810
1. Ask Paul which Morning class Telmuun joins
2. Create SCA: weekStart = 2026-06-29 (or current Monday); 44 days attendance to backfill

### Step 3 -- Resolve Fidelo payment gap
- EUR 1,306 gap = migration artefact; historic Fidelo payments not migrated as SIS records
- Options: (a) create manual payment records for Fidelo amounts, or (b) confirm booking after verifying total paid
UPDATE booking SET confirmed = true WHERE id = 1624; -- NOT YET RUN, only after gap confirmed

### Step 4 -- Reconcile Payment 17956 in Xero
EUR 100, Bank, 2026-03-31 -- xeroPaymentId = null

## Risk / category
- **Category:** bookings / attendance / money | **Reversible?** Yes | **Blast radius:** 1 student; 44 days

## Status
Open -- no fix applied.
**Last checked:** Tue 11 Aug 2026 UTC (92nd check, Issue 48)
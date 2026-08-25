# Issue 15 / Issue 29 — Saikhantes Shagdasuren: Expired SCA + service_end

**Reporter:** Staff | **Area:** Booking / Class | **Sheet rows:** 16 (Issue 15) + 30 (Issue 29) | **Check:** Tue 11 Aug 2026 UTC

## Symptom
No class assignment since 3 Jul. service_end expired. SIS says already assigned.

## Root cause (live data, 11 Aug 2026)
- **Student 1001** (Saikhantes Shagdarsuren), **Booking 18151**
- Status: CONFIRMED, fully paid EUR 1,339.20, EUR 0 open, last updated 8 Jul 2026
- **service_end = 2026-08-07** -- expired **4 days ago**
- **BC 24925** (Academic Year Afternoon): active, ends **2026-10-02** (52 days remaining)
- **SCA 255** (class 11): weekEnd = **2026-07-03** -- expired **39 days ago**; no current SCA
- SIS shows already-assigned because SCA 255 exists with past weekEnd
- **Payment 17872** (EUR 1,339.20, Jun 8 2026): xeroPaymentId = null -- unreconciled

## Fix recipe (NOT YET RUN)

### Step 1 -- Extend service_end
UPDATE booking SET service_end = '2026-10-02' WHERE id = 18151; -- NOT YET RUN

### Step 2 -- Fix class assignment
Option A -- extend SCA 255 weekEnd:
UPDATE student_class_assignment SET week_end = '2026-10-02' WHERE id = 255; -- NOT YET RUN
Option B -- create new SCA via SIS Admin: weekStart = 2026-07-06, weekEnd = 2026-10-02

### Step 3 -- Reconcile Payment 17872 in Xero
EUR 1,339.20, Bank Transfer, Jun 8 2026 -- match to Saikhantes invoice in Xero

## Risk / category
- **Category:** bookings / attendance
- **Reversible?** Yes
- **Blast radius:** 1 student; 39 days attendance unrecorded

## Status
Open -- no fix applied.
**Last checked:** Tue 11 Aug 2026 UTC (97th check Issue 15 / 77th check Issue 29)
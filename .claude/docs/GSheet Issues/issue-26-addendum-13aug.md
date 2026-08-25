# Issue 26 — Ivan Rodriguez (addendum 13 Aug 2026)

**Reporter:** AC | **Area:** booking / class | **Sheet row:** 27 | **Check:** 63rd Thu 13 Aug 2026 UTC

## Symptom
Intensive students only appear once in to be assigned.

## Root cause (unchanged)
- Booking Course 23 (Intensive General 30, bk 22): ended 2026-05-22 — 83 days stale, active = true, 2 class assignments
- Booking Course 24826 (2 weeks Intensive, bk 18034): ended 2026-06-19 — 55 days stale, active = true, 0 class assignments
- Booking 22: CONFIRMED, confirmed = true, EUR 1,948 paid, EUR 0 open
- Booking 18034: PARTIAL, confirmed = false, EUR 845 paid, EUR 250 open
- Payment 17023: EUR 1,698, bk 22, 2026-02-14 — xeroPaymentId = null (180 days unreconciled)
- Payment 17237: EUR 250, bk 22, 2025-10-01 — xeroPaymentId = null (316 days unreconciled)
- Payment 17683: EUR 845, bk 18034, 2026-04-23 — xeroPaymentId = null (112 days unreconciled)

## Fix recipe (NOT YET RUN)

### Step 1 — Verify BC 23 SCAs historical then deactivate
Check all 2 SCA occurrence dates are before 2026-05-22, then:
UPDATE BookingCourse SET active = false, updatedAt = NOW() WHERE id = 23;

### Step 2 — Deactivate BC 24826 (0 SCAs — safe)
UPDATE BookingCourse SET active = false, updatedAt = NOW() WHERE id = 24826;

### Step 3 — Chase EUR 250 on booking 18034
Contact agent/student re: outstanding EUR 250. Once received, set booking 18034 confirmed = true.

### Step 4 — Reconcile payments 17023 / 17237 / 17683 in Xero

## Risk / category
- Category: bookings / financial
- Reversible: yes
- Blast radius: medium — EUR 250 outstanding, 316-day Xero lag

## Status
Unchanged — 83d + 55d stale BCs, EUR 250 open, 3 Xero nulls. Fix NOT RUN.

**Last checked:** 2026-08-13 UTC
# Issue 27 — Sofiia Korkishchenko (addendum 13 Aug 2026)

**Reporter:** AC | **Area:** booking / class | **Sheet row:** 28 | **Check:** 48th Thu 13 Aug 2026 UTC

## Symptom
Old CANCELLED booking still has confirmed = true and an active Booking Course alongside newer booking.

## Root cause (unchanged)
- Booking 17909 (Sofiia Korkishchenko): status = CANCELLED, confirmed = true (anomaly), amountPaid = 0, amountOpen = 727.50
- Last updated 2026-06-17 — 57 days since any change
- Booking Course 24693 (Renewal - Academic Year PM, ends 2026-11-13): active = true on cancelled booking, 0 class assignments
- Same anomaly tracked under Issue 7 (row 8)

## Fix recipe (NOT YET RUN)

### Step 1 — Fix confirmed flag on cancelled booking
UPDATE Booking SET confirmed = false, updatedAt = NOW() WHERE id = 17909;

### Step 2 — Deactivate Booking Course 24693
UPDATE BookingCourse SET active = false, updatedAt = NOW() WHERE id = 24693;

### Step 3 — Verify amountOpen 727.50
amountOpen = 727.50 on a CANCELLED booking with 0 payments — likely data artifact. Confirm no refund owed.

## Risk / category
- Category: bookings / data-hygiene
- Reversible: yes
- Blast radius: low — student enrolled correctly on booking 17849 / BC 24623

## Status
Unchanged — 57 days since last update. Fix NOT RUN.

**Last checked:** 2026-08-13 UTC
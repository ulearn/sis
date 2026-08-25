# Issue 7 — Sofiia Korkishchenko — Addendum 12 Aug 2026

**Sheet row:** 8 | **Check:** 40th hourly Wed 12 Aug 2026 UTC

**Root Cause (unchanged, 65 days open):**
- Booking 17909: status = CANCELLED, confirmed = true (anomaly)
- Amount paid EUR 0, amount open EUR 727.50, no payment records
- Last updated 2026-06-17 — 56 days since last change
- Booking Course 24693 (Renewal - Academic Year PM, ends 13 Nov 2026): active = true on cancelled booking, 0 class assignments
- Student correctly enrolled on booking 17849 / BC 24623 — no current impact

**Fix Recipe (NOT YET RUN):**
UPDATE Booking SET confirmed = false WHERE id = 17909;
UPDATE BookingCourse SET active = false WHERE id = 24693;

**Risk:** data-hygiene | Reversible: yes | Same fix tracked in Issue 27 (row 28)
**Status:** Open — fix NOT RUN. 65 days.
**Last checked:** Wed 12 Aug 2026 UTC (40th check)
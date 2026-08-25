# Issue 27 — Sofiia Korkishchenko (bk 17909 anomaly) — Addendum 12 Aug 2026

**Sheet row:** 28 | **Check:** 47th hourly Wed 12 Aug 2026 UTC

**Root Cause (unchanged, 56 days since booking last updated Jun 17):**
- Booking 17909: status = CANCELLED, confirmed = true (anomaly)
- Booking Course 24693 (Renewal - Academic Year PM, ends 13 Nov 2026): active = true on cancelled booking, 0 class assignments
- Same anomaly tracked under Issue 7 (row 8)

**Fix Recipe (NOT YET RUN):**
UPDATE Booking SET confirmed = false WHERE id = 17909;
UPDATE BookingCourse SET active = false WHERE id = 24693;

**Risk:** data-hygiene | Reversible: yes
**Status:** Open — fix NOT RUN. 56 days since last booking update.
**Last checked:** Wed 12 Aug 2026 UTC (47th check)
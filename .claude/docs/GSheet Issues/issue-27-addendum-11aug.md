# Issue 27 — Sofiia Korkishchenko — Addendum 11 Aug 2026

**Sheet row:** 28 | **Reporter:** PG | **Area:** Booking / Class | **Check:** 46th hourly Tue 11 Aug 2026 UTC

Symptom: Old course ends day new course starts (08/06/2026), keeping her in B2-C1 AM class.

Root Cause (unchanged): Booking 17909 has status=CANCELLED but confirmed=true (anomaly). BC 24693 active=true on a cancelled booking.

Note: Same anomaly also tracked under Issue 7 (row 8).

Current State (11 Aug 2026):
- Booking 17909: status=CANCELLED, confirmed=true, last updated 17 Jun 2026 (55 days ago)
- BC 24693 (Renewal - Academic Year PM, ends 13 Nov 2026): active=true on cancelled booking
- Student enrolled correctly on booking 17849 / BC 24623 — no student-facing impact
- No change from previous check

Fix Recipe (NOT YET RUN):

Step 1 — Clear confirmed flag:
  UPDATE "Booking" SET confirmed = false WHERE id = 17909;

Step 2 — Verify no SCAs on BC 24693, then deactivate:
  SELECT COUNT(*) FROM "StudentClassAssignment" WHERE "bookingCourseId" = 24693;
  UPDATE "BookingCourse" SET active = false WHERE id = 24693;

Risk: data-hygiene | reversible: yes | blast radius: single cancelled booking + one BC | urgency: low

Status: Open — fix NOT RUN. 55 days since booking last updated.
Last checked: Tue 11 Aug 2026 UTC
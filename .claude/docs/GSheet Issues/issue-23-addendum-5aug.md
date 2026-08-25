Issue 23 -- Enshi Lu -- Backwards Course Dates (addendum 5 Aug 2026)
Reporter: (legacy) | Area: Bookings | Sheet row: 24

Symptom
Multiple stale booking courses on booking 787 (Enshi Lu, student 397); BC 828 has backwards start/end dates (DST migration bug).

Root cause
5th check (Wed 5 Aug 2026 UTC) -- unchanged from 4th check (Tue 4 Aug).

Booking 787 (student 397 Enshi Lu): CONFIRMED, confirmed = true, fully paid EUR 2147.50 -- student has left

BC 826 ended 2025-11-28: 250 days stale
BC 827 ended 2026-01-30: 187 days stale
BC 828 start 2026-03-02 end 2026-02-27: BACKWARDS DATES (DST migration bug)
BC 829 ended 2026-06-05: 61 days stale

Fix recipe (NOT YET RUN)

Step 1 -- Confirm correct dates for BC 828 before running:
Check original booking record / Fidelo migration data to determine BC 828 correct end date.
Start date 2 Mar 2026 appears correct; end 27 Feb 2026 is backwards (likely Easter shunt artifact).
Probable correct end: 27 Mar 2026 or 3 Apr 2026 -- verify before updating.

Step 2 -- Fix BC 828 backwards end date (NOT YET RUN):
  UPDATE "BookingCourse" SET end_date = '<confirmed-correct-date>', updated_at = NOW() WHERE id = 828;

Step 3 -- Deactivate all 4 stale booking courses (NOT YET RUN):
  UPDATE "BookingCourse" SET active = false, updated_at = NOW() WHERE id IN (826, 827, 828, 829);

Risk / category
data-hygiene | Low priority -- student has left | Reversible | Blast radius: 1 student

Status: Open -- 250 days max staleness. Backwards dates on BC 828. Fix NOT RUN.
Last checked (UTC): Wed 5 Aug 2026 (5th hourly run)
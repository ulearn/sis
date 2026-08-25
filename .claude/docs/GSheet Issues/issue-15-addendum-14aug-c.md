Issue 15 - Saikhantes Shagdarsuren (115th check, 14 Aug 2026)

Reporter: Various | Area: Booking / Class | Sheet row: 16

SYMPTOM: Course dates and holidays make no sense; student shows in two classes; SCA expired.

ROOT CAUSE (DB evidence 14 Aug 2026 ~21:00 UTC):
Booking 18151 (Saikhantes Shagdarsuren, student 1001):
  status = CONFIRMED, confirmed = true
  serviceEnd = 2026-08-07 (7 days past end), updatedAt = 2026-07-08
Booking Course 24925 (Academic Year Afternoon):
  active = true, startDate = 2026-03-09, endDate = 2026-10-02
Student Class Assignment 255:
  bookingCourseId = 24925, weekStart = 2026-01-12, weekEnd = 2026-07-03 (42 days stale)

Service end passed 7 Aug 2026. SCA 255 last covered week ending 3 Jul 2026.
No new SCA created since SCA 255 expired 42 days ago.
BC 24925 still active through Oct 2 - student may still be enrolled.

FIX RECIPE (NOT YET RUN):

Step 1 - Verify with KC/TB whether Saikhantes is still attending:
  If still attending: create new SCA from current week to BC end date
  If finished: deactivate BC 24925 and update serviceEnd

Step 2a - If still attending, create SCA via SIS admin:
  Student 1001 -> Booking 18151 -> BC 24925 -> Assign to class for current week

Step 2b - If finished, deactivate BC 24925:
SQL: UPDATE booking_course SET active = false WHERE id = 24925;

RISK: Bookings/data - student may be excluded from attendance tracking. Low blast radius.

STATUS: No change since 114th check. SCA 255 weekEnd Jul 3 (42d stale). svcEnd Aug 7 (7d past). Fix NOT RUN.
Last checked: 2026-08-14 ~21:00 UTC
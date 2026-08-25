Issue 22 Addendum -- Edith Nunes Class Assignment (25 Jul 2026, run i)

Reporter: PG | Area: Booking / Class | Sheet row: 23
Last checked: 2026-07-25 UTC (102nd hourly run)
CRITICAL -- next (and penultimate) window is Mon 27 Jul 2026 (2 days)

Status: UNCHANGED

Booking Course 24991 (current, active)
  Name: General English AM | Booking: 18214 | Student: 1015 (Edith Nunes)
  Dates: 2026-07-13 to 2026-08-07
  SCAs: 0 (never assigned to a class)
  Days missed: 10 school days (Jul 14-18 = week 1 + Jul 21-25 = week 2)
  Days remaining: 9 school days (Jul 27-31 = 5, Aug 4-7 = 4; Aug 3 = Bank Holiday if added)

Stale Booking Courses 24933 + 24934
  Both: General English AM | Ended: 2026-07-10 | Still active = true | 15 days stale

Historical SCAs for student 1015 (prior bookings only)
  SCA 48:  weekStart=2026-03-30, classId=7, BC=1751
  SCA 146: weekStart=2026-04-20, classId=7, BC=24668
  Zero SCAs for current BC 24991

Fix Recipe (NOT YET RUN)

Step 1 -- Assign student 1015 to General English AM class for wb Mon 27 Jul
  Via SIS admin: Students > Edith Nunes (1015) > Booking 18214 > BC 24991 > Assign Class
  Target class: General English AM (likely classId=7 based on prior SCAs -- verify in SIS class list)
  Week beginning: 2026-07-27
  Also assign wb 2026-08-04 (check issue 38 Aug BH status first)

Step 2 -- Deactivate stale BCs 24933 + 24934
  UPDATE booking_course SET active = false WHERE id IN (24933, 24934);

Step 3 -- Decision on missed weeks Jul 14-25
  Neil to decide: retroactively assign wb 2026-07-14 and wb 2026-07-21, or leave as missed.

Risk: Bookings / class management. Reversible.
Status: CRITICAL -- 10 school days missed. Mon Jul 27 = next window. Course ends Aug 7.

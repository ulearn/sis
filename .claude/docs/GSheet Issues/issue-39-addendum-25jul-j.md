# Issue 39 Xuezhen Huang — Addendum 99th hrly Sat 25 Jul 2026

STATUS: UNCHANGED from 98th hourly.

Live data (99th hrly):
  Student 14443 (Xuezhen Huang): visaStatus = null (last updated Jul 17 = 8 days)
  Booking course 24609 (Morning General, Jul 13 to Jul 31): active=true
  Student class assignments for BC 24609: 0 — student has NEVER been assigned to a class
  Booking accommodation 11358 (Jul 12 to Aug 2, bed 180): active=true — present and correct

URGENCY:
  Mon 27 Jul = the FINAL week of class (2 days away). Course ends Fri 31 Jul.
  13 school days have now passed without a class assignment.
  If not assigned Mon 27 Jul, student will have attended 0 classes for the entire booking.
  This is the last possible window — missing Mon 27 Jul means permanent zero attendance.

Fix recipe (NOT YET RUN — see issue-39-xuezhen-host-class.md for original full recipe):
  1. Set visaStatus on student 14443 to the appropriate value.
  2. Assign student 14443 to a Morning General class for week beginning Mon 27 Jul
     via SIS admin: Students > Student 14443 > Booking 17831 > BC 24609 > Assign Class.
  3. Verify booking course 24609 shows in the to-be-assigned list after visa status set.

STATUS: Fix NOT RUN. Mon 27 Jul = 2 days away — FINAL window.
Last checked: Sat 25 Jul 2026 UTC (99th hourly)

Issue 39 -- Xuezhen Huang (addendum Sat 25 Jul 2026 UTC)

Sheet row: 41 | Area: Booking / Accomm

Current DB state (Sat 25 Jul 2026 UTC):
  Student 14443 Xuezhen Huang, visaStatus=null
  BK 17831 CONFIRMED confirmed=true, amtPaid=EUR 1396.90, amtTotal=EUR 1396.90 (fully paid)
  BC 24609: Morning General, Jul 13 to Jul 31, active=true
  BA 11358: Jul 12 to Aug 2, bedId=180, fee=EUR 900 (host family assigned)
  SCAs: 0 -- no class assignments for the entire course period

School days count:
  Missed: 10 (weeks Jul 13 and Jul 20)
  Remaining: 5 (Mon Jul 27, Tue 28, Wed 29, Thu 30, Fri 31)
  Today is Saturday -- next assignment window is Monday 27 Jul
  Course ends Fri Jul 31; BA continues to Aug 2 (weekend checkout)

Root cause: visaStatus=null is the most likely blocker for class-to-be-assigned view.
Student has accommodation (bed 180 confirmed) but zero class attendance ever.

Fix recipe (NOT YET RUN):
Step 1 -- Fix visaStatus for student 14443:
  In SIS admin: set visa_status = approved
  SQL (NOT YET RUN): UPDATE students SET visa_status=approved WHERE id=14443;
Step 2 -- Assign to Morning General class for wb Mon 27 Jul via SIS class-assignment UI.
  Only 5 school days remain. Monday 27 Jul is the last effective action window.

Risk: CRITICAL -- course ends Fri 31 Jul. 10 days missed, 5 remain.
Last checked: Sat 25 Jul 2026 UTC

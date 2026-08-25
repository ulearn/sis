Issue 22 Edith Nunes — Addendum 98th hrly Sat 25 Jul 2026

STATUS: UNCHANGED from 97th hourly.

Live data (98th hrly):
  Student 1015 (Edith Nunes / Edite Nunes in HubSpot)
  Booking 18214 (Jul 13 to Aug 7, EUR 608): active
  Booking course 24991 (General English AM, Jul 13 to Aug 7): active=true
  Student class assignments for BC 24991: 0 — no assignment since booking started Jul 13
  Stale BCs from prior booking: BC 24933 (active=true, ended Jul 10), BC 24934 (active=true, ended Jul 10)

URGENCY:
  12 school days missed (Jul 13 to Jul 24). 9 school days remain (Jul 27 to Aug 7).
  Mon 27 Jul = next available week beginning for class assignment.
  If not assigned Mon 27 Jul, student misses more than half the booking.

Fix recipe (NOT YET RUN — see issue-22-edith-nunes-payment-dups.md for original full recipe):
  1. Deactivate stale booking courses:
     UPDATE booking_courses SET active = false WHERE id IN (24933, 24934);
  2. Assign student 1015 to AM General English class wb Mon 27 Jul
     via SIS admin: Students > Student 1015 > Booking 18214 > BC 24991 > Assign Class.
  3. Verify student 1015 appears in TBA list.

STATUS: Fix NOT RUN. Mon 27 Jul = 2 days away (10d missed, 9d remain).
Last checked: Sat 25 Jul 2026 UTC (98th hourly)
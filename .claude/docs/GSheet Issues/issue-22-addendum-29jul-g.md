# Issue 22 — Edith Nunes — Visa Null (153rd check, 29 Jul 2026)
Reporter: ST | Area: Booking / Class | Sheet row: 23

Root cause (153rd check, 29 Jul 2026 UTC)
- Student 1015 (Edith Nunes): visaStatus = null. UNCHANGED.
- Booking course 24991 (General English AM): Jul 13-Aug 7 2026, active = true, zero class assignments.
- CRITICAL: 6 teaching days remain (Jul 30, Jul 31, Aug 4, Aug 5, Aug 6, Aug 7; Aug 3 = bank holiday).
- HubSpot contact ID: 790679262424.
- Stale booking courses 24933, 24934, 24665, 24668 still active.

Fix recipe — NOT YET RUN

Step 1 — Check HubSpot for visa status
NOT YET RUN: HubSpot contact 790679262424, confirm visa is approved.

Step 2 — Set visa status in SIS
NOT YET RUN:
  UPDATE students SET visa_status='APPROVED',updated_at=NOW() WHERE id=1015;

Step 3 — Assign booking course 24991 to AM class
NOT YET RUN:
  SIS admin -> Student 1015 -> Booking -> BC 24991 -> Assign to correct AM General English class.

Step 4 — Deactivate stale booking courses
NOT YET RUN:
  UPDATE booking_courses SET active=false,updated_at=NOW() WHERE id IN (24933,24934,24665,24668);

Risk: Data hygiene + bookings, low risk, reversible. Course ends Aug 7 (6 teaching days).
Status: OPEN — Fix NOT RUN. 153rd check 29 Jul 2026 UTC.
Last checked: 2026-07-29 UTC (153rd check)

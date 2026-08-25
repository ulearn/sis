# Issue 22 — Edith Nunes — Visa Null (152nd check, 29 Jul 2026)
Reporter: ST | Area: Booking / Class | Sheet row: 23

Root cause (152nd check, 29 Jul 2026 UTC)
- Student 1015 (Edith Nunes): visaStatus = null. UNCHANGED.
- BC 24991 (General English AM): Jul 13-Aug 7 2026, active=true, zero SCAs.
- CRITICAL: approx 7 teaching days remain (Jul29-31=3; Aug3=BH closed; Aug4-7=4).
- HubSpot contact ID: 790679262424.
- Stale BCs 24933, 24934, 24665, 24668 still active.

Fix recipe — NOT YET RUN
1. Check HubSpot 790679262424 for visa status.
2. SIS admin: student 1015 -> Visa Status -> Approved.
   UPDATE students SET visa_status='APPROVED', updated_at=NOW() WHERE id=1015;
3. Assign BC 24991 to AM class.
4. Deactivate BCs 24933, 24934, 24665, 24668:
   UPDATE booking_courses SET active=false WHERE id IN (24933,24934,24665,24668);

Status: Open — Fix NOT RUN
Last checked: Wed 29 Jul 2026 UTC (152nd check)
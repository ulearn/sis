Issue 22 -- Edite Nunes Class Assignment Missing (150th check, 29 Jul 2026)

Reporter: PG | Area: Booking / Class | Sheet row: 23

Symptom
=======
Student not appearing in to-be-assigned. Two payments with same invoice number.

Root cause (DB, 29 Jul 2026 UTC -- 150th hourly check)
======================================================
- Student 1015 (Edith Nunes): visaStatus = null -- blocks class-to-be-assigned appearance. UNCHANGED.
- Booking course 24991 (General English AM, 13 Jul to 7 Aug 2026): active = true, 0 class assignments. UNCHANGED.
- Course ends 7 Aug 2026 -- 9 days remaining. CRITICAL.
- Fully paid EUR 608. HubSpot contact ID 790679262424.
- Stale booking courses 24933 and 24934 still active -- deactivate after main fix.

Fix recipe -- NOT YET RUN
=========================

Step 1 -- Set visa status on student 1015
NOT YET RUN:
  SIS admin -> Student 1015 (Edith Nunes) -> set visaStatus from HubSpot contact 790679262424.
  Once set, student will appear in class-to-be-assigned for BC 24991.

Step 2 -- Assign BC 24991 to a class
NOT YET RUN:
  SIS admin -> Booking 18214 -> BC 24991 -> assign class for WB Mon 27 Jul (or next available Mon).

Step 3 -- Deactivate stale booking courses 24933 and 24934
NOT YET RUN:
  UPDATE booking_courses SET active = false, updated_at = NOW()
  WHERE id IN (24933, 24934);

Risk / category
===============
Bookings / class assignment. Reversible. Blast radius: 1 student, 3 booking courses.

Status
======
OPEN -- Fix NOT RUN. 150th check 29 Jul 2026 UTC.
CRITICAL: 9 days remain (course ends 7 Aug 2026).

Last checked
============
2026-07-29 UTC
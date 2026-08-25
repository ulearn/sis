Issue 39 - Xuezhen Huang (Addendum 25 Jul 2026)
Reporter: Diego | Area: Booking / Accomm | Sheet row: 41

Symptom: Student paid for 3-week host-family accommodation but never assigned to class.

Current status (67th hourly, Sat 25 Jul 2026 UTC)
- Student 14443 Xuezhen Huang: visaStatus = null (last DB update 17 Jul, 8d ago)
- Booking 17831: CONFIRMED, fully paid EUR 1,396.90
- Booking course 24609 (Morning General): 13 Jul to 31 Jul 2026, active = true
- Booking accommodation 11358: Jul 12 to Aug 2, bed 180, active = true
- Class assignments: 0 — student NEVER assigned to any class
- 10 school days elapsed (Jul 13 + Jul 20 weeks); 5 remain (Mon 28 to Fri 31 Jul)
- Mon 28 Jul 2026 is the FINAL window; course ends Fri 31 Jul

Root cause: visaStatus = null blocks student from class-to-be-assigned queue.

Fix recipe (NOT YET RUN)
1. SIS Admin -> Student 14443 -> Personal Details -> set Visa Status (confirm with Diego)
2. Classes -> To Be Assigned -> wb Mon 28 Jul 2026 -> assign to Morning General

DB fallback:
  UPDATE students SET visa_status = 'NOT_REQUIRED' WHERE id = 14443;  -- NOT YET RUN

Risk: bookings/class-assignment; reversible; blast radius: student 14443 only
CRITICAL: course ends Fri 31 Jul; Mon 28 Jul is the last effective window

Status: OPEN unchanged since 17 Jul. Last checked: Sat 25 Jul 2026 UTC (67th hourly)
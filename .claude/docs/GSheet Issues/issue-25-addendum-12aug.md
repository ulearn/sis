Issue 25 — Uyanga Tungalag — visa null, 0 SCAs, day 108 (addendum 12 Aug 2026)
Sheet row: 26 | Reporter: AC | Area: visa / class

Symptom
Visa status not selectable (PrismaClientKnownRequestError on save); student not appearing in class-to-be-assigned list.

Root cause (live data — Wed 12 Aug 2026 UTC, 158th check)
- Student 917 (Uyanga Tungalag): visa_status = null, hubspot_contact_id = null
  Last updated 2026-07-28 — 15 days without change
- Booking 1467: CONFIRMED, confirmed = true, EUR 2,405 paid, EUR 0 open, service_end 2026-10-30
  Fully paid — financial side is clean
- Booking Course 1613 (Academic Year Morning, 27 Apr to 30 Oct 2026): active = true, 0 class assignments
  108 calendar days since course start — no attendance recorded at all

Root issue: student was imported from Fidelo without visa_status being set.
The null value blocks the SIS to-be-assigned filter which requires visa_status to be non-null.
The PrismaClientKnownRequestError on save may indicate a dependency between visa_id and visa_status fields.

Fix recipe (NOT YET RUN)
Step 1 — Set visa_status via direct SQL if SIS admin throws error:
  First check current fields: SELECT id, visa_status, visa_id, visa_from, visa_until FROM student WHERE id = 917;
  Then: UPDATE student SET visa_status = 'approved' WHERE id = 917;

Step 2 — Link HubSpot contact:
  Find Uyanga Tungalag's contact ID in HubSpot CRM.
  In SIS admin: Student 917 -> set HubSpot contact ID and save.

Step 3 — Assign BC 1613 to AM class in SIS admin:
  Uyanga is an ILEP Academic Year Morning student (booking 1467, started Apr 27).
  Assign student 917 to BC 1613 with weekStart=2026-04-27 (or earliest available), weekEnd=2026-10-30.

Note: 108 calendar days of historical attendance cannot be recovered.
      Priority is to unblock her for current and future weeks.

Risk / category
Attendance (108 days lost) + data integrity (HubSpot null). Fix is low-risk and reversible. Student is fully paid.

Status: open — fix NOT RUN
Last checked: Wed 12 Aug 2026 UTC
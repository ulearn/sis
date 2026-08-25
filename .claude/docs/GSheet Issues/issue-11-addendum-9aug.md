Issue 11: Valeriya Salauyova - BC 24696 Stale 37d, HubSpot Null
Reporter: Staff | Area: Booking/Accomm | Sheet row: 12 | 16th check Sun 9 Aug 2026 UTC

SYMPTOM
Guardian booking anomaly - Valeriya Salauyova (minor, age 16). BC stale, HubSpot ID missing.

ROOT CAUSE - 16th check (first Sun 9 Aug); stale count updated from 15th
Student 1063 (Valeriya Salauyova): hubspotContactId=null, visaStatus=null, DOB 25 May 2010 (age 16)
Booking 17912: CONFIRMED, confirmed=true, fully paid EUR 1,938
BC 24696 (General English AM Plus, ended 3 Jul 2026): active=true -- 37 days stale
No continuing booking.

FIX RECIPE - NOT YET RUN
Step 1 - Deactivate BC 24696:
UPDATE "BookingCourse" SET active=false WHERE id=24696;

Step 2 - Backfill HubSpot contact ID:
Search HubSpot for Valeriya Salauyova, then:
UPDATE "Student" SET "hubspotContactId"='<HSID>' WHERE id=1063;

Step 3 - Verify:
SELECT id, "firstName", "lastName", "hubspotContactId" FROM "Student" WHERE id=1063;
SELECT id, active, "endDate" FROM "BookingCourse" WHERE id=24696;

RISK: data-hygiene/bookings. Reversible. Blast radius: student 1063 only.

STATUS: OPEN. BC24696 37d stale. 16th check Sun 9 Aug 2026 UTC.
Last checked: 2026-08-09 UTC
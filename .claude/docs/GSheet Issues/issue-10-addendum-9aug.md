Issue 10: Massimiliano Cameran - Bk97 Missing Cert, BCs 107+24793 Stale
Reporter: Staff | Area: Booking/Accomm | Sheet row: 11 | 46th check Sun 9 Aug 2026 UTC

SYMPTOM
Accommodation stay anomaly. Booking 97 missing completion certificate; two stale Booking Courses.

ROOT CAUSE - 46th check (first Sun 9 Aug); stale counts updated from 45th
Booking 97 (Massimiliano Cameran, student 91): CONFIRMED, confirmed=false, EUR 1,741 paid, EUR 0 open
No cert on booking 97:
  DR 63: template 78 (invoice), REVOKED
  DR 64: template 78 (invoice), ISSUED
  DR 179: template 82 (Certificate of Completion), ISSUED 5 Jun 2026 -- belongs to booking 18002, NOT booking 97
BC 107  (Morning General, ended 22 May 2026): active=true -- 79 days stale (booking 97)
BC 24793 (General English AM, ended 5 Jun 2026): active=true -- 65 days stale (booking 18002)
SCA 235 on BC 107: classId=12, weekStart=27 Apr, weekEnd=22 May -- terminal, correct

FIX RECIPE - NOT YET RUN
Step 1 - Set booking 97 confirmed=true:
UPDATE "Booking" SET confirmed=true WHERE id=97;

Step 2 - Deactivate BCs 107 + 24793:
UPDATE "BookingCourse" SET active=false WHERE id IN (107,24793);

Step 3 - Generate cert for booking 97 via SIS Admin (template 82 Certificate of Completion, Morning General, ended 22 May 2026).

Step 4 - Verify:
SELECT dr.id, dt.slug, dr.status, dr."bookingId" FROM "DocumentRecord" dr
JOIN "DocumentTemplate" dt ON dt.id=dr."templateId" WHERE dr."studentId"=91 ORDER BY dr.id;
Expected: new DR with bookingId=97, slug=Certificate, status=ISSUED.

RISK: documents/bookings/data-hygiene. Reversible. Blast radius: student 91 only.

STATUS: OPEN. BC107 79d stale, BC24793 65d stale. 46th check Sun 9 Aug 2026 UTC.
Last checked: 2026-08-09 UTC
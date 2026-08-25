# Issue 9 --- Suvderdene Bayartsog

**Reporter:** AC  
**Area:** Doc Gen / Certs  
**Sheet row:** 10  

## Symptom

The certificate automatically displays the dates from her previous course.

## Root cause

- Document 171 is a DRAFT Certificate of Completion (template 82) created 5 June 2026 for booking 1498.
- The document was never issued — issuedAt = null, status = DRAFT, 32 days old as of 6 July 2026.
- Booking 1498: status = CONFIRMED, confirmed = false, amountPaid = null (migration-era booking).
- Booking course 1660 (ULearn Renewal Morning): ended 5 June 2026, still active = true (stale flag).
- Certificate content (student name, dates, ILEP code) confirmed complete in HTML. Issue is it was never issued.

**Evidence (6 Jul 2026 UTC, 28th check):**
- document 171: status=DRAFT, templateId=82, createdAt=2026-06-05T09:25:54Z, issuedAt=null
- booking 1498: status=CONFIRMED, confirmed=false, amountPaid=null
- booking course 1660: name=ULearn Renewal Morning, endDate=2026-06-05, active=true

## Fix recipe

**Step 1 --- Issue the certificate via SIS admin (NOT YET RUN):**
- Navigate to SIS > Students > student 947 (Suvderdene Bayartsog)
- Open booking 1498
- Click Documents tab
- Locate document 171 (Certificate of Completion, DRAFT)
- Click the Issue button
- Confirm the PDF generates and issuedAt is now set

**Step 2 --- Optional: deactivate stale booking course (NOT YET RUN):**
  UPDATE booking_courses SET active=false WHERE id=1660;
(Low priority --- only if the stale active flag causes display issues)

**Step 3 --- Optional: set confirmed flag (NOT YET RUN):**
  UPDATE bookings SET confirmed=true WHERE id=1498;
(Cosmetic only --- booking is CONFIRMED and course ended)

## Risk / category

- **Category:** Documents
- **Reversible?** Yes
- **Blast radius:** Single document, single student, no financial impact

## Status

Open --- document 171 DRAFT 32 days, not issued

## Check history

**6 Jul MON UTC (28th check, fresh DB): CONFIRMED UNCHANGED. document 171 DRAFT 32 days (createdAt=Jun05, issuedAt=null, templateId=82). bk1498 CONFIRMED confirmed=false amountPaid=null. bc1660 ULearn Renewal Morning ended Jun05 STILL active=true. Content confirmed complete. NEIL: SIS student 947 > booking 1498 > Documents > Issue document 171. Last checked: 2026-07-06 UTC (28th check, hrly bot).**

**8 Jul UTC (33rd check): CONFIRMED UNCHANGED. Doc171 DRAFT issuedAt=STILL null (33 days). BK1498 CONFIRMED confirmed=false amtPaid=null. BC1660 ULearn-Renewal-Morn ended Jun05 STILL active=true (33d stale). NEIL: SIS student 947 > booking 1498 > Documents > Issue. Last checked: 2026-07-08 UTC.**

**8 Jul UTC (34th check): CONFIRMED UNCHANGED. Doc171 DRAFT issuedAt=STILL null (33 days since Jun05). BK1498 CONFIRMED confirmed=false amtPaid=null amtTotal=null. BC1660 ULearn-Renewal-Morn (Dec15-Jun05 2026) STILL active=true (33d past end). NEIL: SIS student 947 > booking 1498 > Documents > Issue button. Last checked: 2026-07-08 UTC (hrly12).**

**13 Jul MON UTC (39th check, fresh DB): CONFIRMED UNCHANGED. Doc171 DRAFT issuedAt=STILL null (38 days since Jun05). BK1498 CONFIRMED confirmed=false amtPaid=null (updAt=May21). BC1660 ULearn-Renewal-Morn ended Jun05 active=STILL true (38d stale). NEIL: SIS student 947 > booking 1498 > Documents > Issue document 171. Last checked: 2026-07-13 UTC (39th check).**

**14 Jul TUE UTC (40th check, fresh DB): CONFIRMED UNCHANGED. Doc171 DRAFT issuedAt=STILL null (39 days since Jun05). BK1498 CONFIRMED confirmed=false amtPaid=null (updAt=May21). BC1660 ULearn-Renewal-Morn ended Jun05 active=STILL true (39d stale). NEIL: SIS student 947 > booking 1498 > Documents > Issue document 171. Last checked: 2026-07-14 UTC (40th check).**
**15 Jul WED UTC (41st check, fresh DB): CONFIRMED UNCHANGED. Doc171 DRAFT issuedAt=STILL null (40d since Jun05). BK1498 CONFIRMED confirmed=false amtPaid=null amtTotal=null (updAt=May21). Fix NOT RUN. Last checked: 2026-07-15 UTC (41st check).**
**42nd check Sat 18 Jul UTC (fresh DB). UNCHANGED. Doc171 DRAFT issuedAt=null (43d since Jun05, updAt=Jun05). BK1498 CONF confirmed=false amtPaid=null amtTotal=null (updAt=May21). Fix NOT RUN. Last checked: 2026-07-18 SAT UTC (42nd check).**